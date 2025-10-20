export function generateReportPDF(data) {
  const header = `Report: ${data.type || "Analysis"}\nGenerated: ${new Date().toLocaleString()}\n\n`;
  const body = JSON.stringify(data, null, 2);
  const content = header + body;
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const filename = `report-${(data.type || "analysis").replace(/\s+/g, "-").toLowerCase()}-${Date.now()}.txt`;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
