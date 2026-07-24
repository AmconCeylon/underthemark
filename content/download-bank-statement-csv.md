---
title: How to Download Your Bank Statement as a CSV
slug: download-bank-statement-csv
category: How to
order: 04
titletag: Download Your Bank Statement as CSV
summary: Every bank offers this and every bank hides it somewhere different. Here is where to look, what to choose, and what to do when the file will not open properly.
published: 2026-07-04
modified: 2026-07-21
updated: July 2026
---

A CSV is just a text file of your transactions, one per line, with commas between the columns. It is the format every budgeting tool, spreadsheet and accountant asks for, and every bank in the world can produce one. What varies enormously is how far they bury it.

This guide covers where to find it, which options to pick, and how to fix the file when it comes out wrong.

## The general pattern

Before the specifics, the shape is nearly always the same:

1. Log in on a **desktop browser**, not the phone app. This is the single most common obstacle — many banks offer exports only on the web, and people conclude their bank does not support it because the app has no button.
2. Open the account, not the overview page.
3. Look for **Statements**, **Documents**, **Download**, **Export** or an icon of a downward arrow near the transaction list.
4. Choose a date range. Take at least three months. Twelve if the option exists, because annual charges will not appear in a shorter window.
5. Choose the format. Pick **CSV**. If CSV is not offered, look for **Excel**, **Comma delimited**, **Spreadsheet** or **QIF**. Avoid PDF — it looks like a statement but the data is not readable by software.

[[AD]]

## Where each bank hides it

Interfaces change, so treat these as directions rather than exact clicks.

**Chase** — select the account, then the download icon above the activity list. Choose "Spreadsheet (Excel, CSV)" and set your date range.

**Bank of America** — open the account, then Statements & Documents, then Download. Microsoft Excel format produces a usable CSV.

**Wells Fargo** — account view, then Download Account Activity. Choose Comma Delimited.

**Citi** — account details, then the export icon near the transaction list.

**Capital One** — account, then Download Transactions, near the top of the transaction list.

**Barclays (UK)** — open the account, then Statements, then Export. Choose CSV, and note the maximum range is often shorter than you would like, so you may need two exports.

**HSBC (UK)** — statements section, then Download, then choose CSV rather than PDF.

**Lloyds / Halifax (UK)** — from the account, look for "Export" or "Download transactions". Internet Banking Text and CSV are both fine.

**Monzo, Starling, Revolut** — these are the friendly ones. Statements or Analytics, then Export, then CSV. Monzo and Starling both do this in-app as well as on the web.

**Commercial Bank / Sampath / HNB (Sri Lanka)** — internet banking on desktop, account statement, choose a date range, then look for Excel or CSV among the download options alongside PDF.

**Sberbank / Tinkoff (Russia)** — statement section (выписка), select the period, and choose the CSV or Excel option rather than PDF.

If your bank genuinely offers only PDF, there is one more route: many banks let you export from their *search* or *advanced transaction* screen even when the statements page does not. It is worth checking there before giving up.

## What a good file looks like

Open it in any spreadsheet program. You want to see something along these lines:

```
Date,Description,Amount,Balance
07/04/2026,SQ *SPOTIFY USA 855-555-1234,-11.99,4188.02
07/06/2026,DIRECT DEP PAYROLL ACME CORP,2400.00,6588.02
```

Three things matter: a date column, a description column, and an amount. Everything else is optional.

Do not worry about how ugly the descriptions look. `SQ *SPOTIFY USA 855-555-1234` is normal — that prefix is the payment processor, and the digits are a merchant reference. Any decent budgeting tool will tidy this up into "Spotify" for you.

## Common problems and how to fix them

**Everything lands in one column.** Your file uses a different separator. European banks often use semicolons rather than commas because the comma is their decimal point. In Excel, use Data → Text to Columns and pick the right separator. Better still, use a tool that detects the separator itself.

**The dates are wrong by a month.** This is the day-first versus month-first problem. `03/04/2026` is the third of April in most of the world and the fourth of March in the United States. Spreadsheets guess based on your system settings and guess wrong constantly. Any tool worth using will let you tell it which order the file uses.

**Amounts show as text, or 1.234,56 becomes broken.** Same root cause — decimal comma versus decimal point. If your bank writes `1.234,56` meaning one thousand two hundred and thirty-four, a program expecting `1,234.56` will mangle it.

**Spending appears as positive numbers.** Some banks use negative for money out; others put everything positive and use a separate column to say which direction it went. Neither is wrong, but a tool needs to know which convention your bank uses.

**There are junk lines above the header.** Many exports begin with account numbers and address lines before the real column headers. Delete those rows, or use a tool that finds the header row itself.

**The file opens in Excel with leading zeros stripped.** Harmless for budgeting. Only matters if you need account numbers preserved.

## A note on safety

A statement CSV is sensitive. It contains where you shop, when, and how much you have.

Be careful about what you upload it to. Plenty of online converters and budgeting sites ask you to upload the file to their servers, and once it is there you have no way of knowing what happens to it.

The safer pattern is a tool that reads the file inside your own browser without uploading it. You can verify this yourself: disconnect from the internet, then load the file. If it still works, nothing was sent anywhere.

That is how [Under the Mark](/) handles it — the file is read in the page, never transmitted, and there is no account or server involved. It reads comma, semicolon, tab and pipe files, detects the date order, asks you to confirm which column is which, and groups transactions into one line per merchant per month.

## What to do once you have the file

Look for what repeats. Same merchant, similar amount, roughly thirty days apart — those are your subscriptions, and they are almost always more expensive in total than people expect.

From there, our guides on [cancelling subscriptions](/articles/cancel-subscriptions/) and [finding cheaper alternatives](/articles/cheaper-alternatives/) cover what to do with the list, and [budget vs actual](/articles/budget-vs-actual/) explains the method that keeps it from creeping back up.

[[AMCON]]
