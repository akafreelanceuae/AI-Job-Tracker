# ADR 0001: Export implementations (CSV, XLSX, PDF)

Decision:
- Use SheetJS (xlsx) to generate real Excel workbooks in the browser.
- Use jsPDF with jspdf-autotable to generate printable PDF tables in the browser.
- Keep a print-friendly page as a fallback for system print-to-PDF flows.

Rationale:
- XLSX via SheetJS avoids server-side headless Chrome complexity.
- jsPDF provides lightweight, client-side PDF generation; table plugin keeps code small and focused.

Tradeoffs:
- jsPDF tables are simpler than full HTML-to-PDF rendering; complex layouts should still use the print route.
- For large datasets, browser memory can be a constraint; consider server-side export if needed later.