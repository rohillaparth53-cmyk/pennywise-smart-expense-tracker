# Pennywise

Pennywise is a beginner-friendly personal expense tracker built for a hackathon. It helps users categorize spending, set category budgets, and understand where their money goes each month.

## Features

- Add income and expenses with a date, category, and optional note
- Suggest a category from transaction names such as **Swiggy**, **Netflix**, and **Uber**
- View current balance, monthly spending, and top spending category
- View a category-wise spending chart
- Set budgets for food, grocery, travel, entertainment, subscriptions, and more
- Receive visual warnings at 80% of a budget and when a budget is crossed
- Filter and delete transactions
- Get spending insights
- Saves data in the browser, so no login or server is needed

## Run the project

This is a plain HTML, CSS, and JavaScript project—no installation required.

1. Download or clone this repository.
2. Open `index.html` in a browser.
3. Or, in VS Code, install the **Live Server** extension and choose **Open with Live Server** on `index.html`.

> The spending chart uses Chart.js from a CDN, so the browser needs internet access the first time it loads.

## Tech stack

- HTML
- CSS
- Vanilla JavaScript
- Chart.js
- Browser Local Storage

## Project structure

```text
Pennywise/
├── index.html     # App layout and screens
├── styles.css     # Responsive design
├── app.js         # App logic, budgets, charts, and storage
└── README.md      # Project instructions
```

## Hackathon pitch

**Pennywise turns scattered daily expenses into clear categories, budgets, and insights so users can spend smarter.**

For a demo, add a few payments such as Swiggy, BigBasket, Netflix, Uber, and electricity bills. The dashboard updates immediately and clearly shows the user where their money is going.
