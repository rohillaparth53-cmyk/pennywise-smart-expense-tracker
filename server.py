#!/usr/bin/env python3
"""
PennyWise AI - Backend Server
Provides static asset serving and secure AI Copilot endpoint (/api/chat).
Works with zero external dependencies (pure Python standard library).
"""

import http.server
import json
import os
import socketserver
import urllib.request
import urllib.error
from urllib.parse import urlparse

# Load .env file if present
def load_env():
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, val = line.split("=", 1)
                    os.environ[key.strip()] = val.strip().strip('"').strip("'")

load_env()

PORT = int(os.environ.get("PORT", 8000))
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")

class PennyWiseHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Enable CORS for local testing
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_POST(self):
        parsed_url = urlparse(self.path)
        if parsed_url.path == "/api/chat":
            self.handle_chat()
        else:
            self.send_error(404, "Endpoint not found")

    def handle_chat(self):
        content_length = int(self.headers.get("Content-Length", 0))
        if content_length <= 0 or content_length > 65536:
            self.send_response(400)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Invalid request payload size"}).encode("utf-8"))
            return

        body = self.rfile.read(content_length).decode("utf-8")
        try:
            data = json.loads(body)
        except json.JSONDecodeError:
            self.send_response(400)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Malformed JSON"}).encode("utf-8"))
            return

        message = data.get("message", "").strip()
        financial_context = data.get("financialContext", {})

        if not message:
            self.send_response(400)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Message parameter is required"}).encode("utf-8"))
            return

        # Check if an external LLM key is configured
        llm_reply = None
        if GEMINI_API_KEY:
            llm_reply = self.call_gemini(message, financial_context)
        elif OPENAI_API_KEY:
            llm_reply = self.call_openai(message, financial_context)

        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()

        response_payload = {
            "reply": llm_reply,
            "mode": "cloud_llm" if llm_reply else "local_fallback"
        }
        self.wfile.write(json.dumps(response_payload).encode("utf-8"))

    def call_gemini(self, message, ctx):
        system_prompt = (
            "You are PennyWise AI, a strictly grounded, factual personal finance copilot.\n"
            "STRICT ZERO-HALLUCINATION RULES:\n"
            "1. You MUST base all answers strictly and exclusively on the User Financial Context provided below.\n"
            "2. Never invent balances, fake transactions, or speculative figures.\n"
            "3. If a merchant, transaction, or category is not present in the data, state clearly: 'I have no record of that in your transactions.' Do not extrapolate or guess.\n"
            "4. Do not perform speculative mental arithmetic; use the pre-calculated figures provided in the context.\n"
            "5. All figures are in Indian Rupees (INR, ₹). Be concise, clear, and actionable (maximum 2-3 sentences).\n\n"
            f"User Financial Context:\n{json.dumps(ctx, indent=2)}"
        )

        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
        payload = {
            "contents": [
                {
                    "role": "user",
                    "parts": [
                        {"text": f"{system_prompt}\n\nUser Question: {message}"}
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.0,
                "maxOutputTokens": 400
            }
        }

        try:
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json"},
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=10) as resp:
                result = json.loads(resp.read().decode("utf-8"))
                candidates = result.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    if parts:
                        return parts[0].get("text", "")
        except Exception as e:
            print(f"[Gemini API Exception] {e}")
        return None

    def call_openai(self, message, ctx):
        system_prompt = (
            "You are PennyWise AI, a strictly grounded, factual personal finance copilot.\n"
            "STRICT ZERO-HALLUCINATION RULES:\n"
            "1. You MUST base all answers strictly and exclusively on the User Financial Context provided below.\n"
            "2. Never invent balances, fake transactions, or speculative figures.\n"
            "3. If a merchant, transaction, or category is not present in the data, state clearly: 'I have no record of that in your transactions.' Do not extrapolate or guess.\n"
            "4. Do not perform speculative mental arithmetic; use the pre-calculated figures provided in the context.\n"
            "5. All figures are in INR (₹). Be concise, clear, and actionable (maximum 2-3 sentences).\n\n"
            f"User Financial Context:\n{json.dumps(ctx, indent=2)}"
        )

        url = "https://api.openai.com/v1/chat/completions"
        payload = {
            "model": "gpt-4o-mini",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": message}
            ],
            "temperature": 0.0,
            "max_tokens": 400
        }

        try:
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {OPENAI_API_KEY}"
                },
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=10) as resp:
                result = json.loads(resp.read().decode("utf-8"))
                choices = result.get("choices", [])
                if choices:
                    return choices[0].get("message", {}).get("content", "")
        except Exception as e:
            print(f"[OpenAI API Exception] {e}")
        return None

def run():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), PennyWiseHandler) as httpd:
        print(f"==================================================")
        print(f"🚀 PennyWise AI Platform running at http://localhost:{PORT}")
        print(f"   AI Provider: {'Gemini API' if GEMINI_API_KEY else ('OpenAI API' if OPENAI_API_KEY else 'Local Neural Grounded Engine')}")
        print(f"==================================================")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down PennyWise AI server.")

if __name__ == "__main__":
    run()
