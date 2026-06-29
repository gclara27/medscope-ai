"""Analytics PDF report generation (T-X04, UC-063)."""

from __future__ import annotations

from datetime import UTC, datetime
from io import BytesIO

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

from schemas.analytics import AnalyticsResponse

_RISK_LABELS = {
    "low": "Low",
    "medium": "Medium",
    "high": "High",
}


def _format_period(analytics: AnalyticsResponse) -> str:
    if analytics.date_from and analytics.date_to:
        return f"{analytics.date_from.isoformat()} to {analytics.date_to.isoformat()}"
    if analytics.date_from:
        return f"From {analytics.date_from.isoformat()}"
    if analytics.date_to:
        return f"Through {analytics.date_to.isoformat()}"
    return "All time"


def build_analytics_pdf(analytics: AnalyticsResponse) -> bytes:
    """Render analytics KPIs, distribution, and trend data into a PDF report."""
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        leftMargin=0.75 * inch,
        rightMargin=0.75 * inch,
        topMargin=0.75 * inch,
        bottomMargin=0.75 * inch,
        title="MedScope AI Analytics Report",
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "ReportTitle",
        parent=styles["Heading1"],
        fontSize=18,
        textColor=colors.HexColor("#0058bc"),
        spaceAfter=6,
    )
    subtitle_style = ParagraphStyle(
        "ReportSubtitle",
        parent=styles["Normal"],
        fontSize=10,
        textColor=colors.HexColor("#5f6368"),
        spaceAfter=14,
    )
    section_style = ParagraphStyle(
        "SectionHeading",
        parent=styles["Heading2"],
        fontSize=12,
        textColor=colors.HexColor("#191c1d"),
        spaceBefore=10,
        spaceAfter=8,
    )

    generated_at = datetime.now(UTC).strftime("%Y-%m-%d %H:%M UTC")
    summary = analytics.summary

    story: list = [
        Paragraph("MedScope AI — Population Analytics Report", title_style),
        Paragraph(
            f"Reporting period: {_format_period(analytics)}<br/>Generated: {generated_at}",
            subtitle_style,
        ),
    ]

    story.append(Paragraph("Executive summary", section_style))
    kpi_rows = [
        ["Metric", "Value"],
        ["Total evaluations", str(summary.total_predictions)],
        ["Average readmission risk", f"{summary.average_risk_percent:.2f}%"],
        ["High risk evaluations", str(summary.high_risk_count)],
        ["Medium risk evaluations", str(summary.medium_risk_count)],
        ["Low risk evaluations", str(summary.low_risk_count)],
        [
            "Average prediction time",
            f"{summary.average_prediction_time_ms:.1f} ms"
            if summary.average_prediction_time_ms is not None
            else "N/A",
        ],
    ]
    story.append(_styled_table(kpi_rows, [3.5 * inch, 2.5 * inch]))
    story.append(Spacer(1, 0.15 * inch))

    story.append(Paragraph("Risk distribution", section_style))
    distribution_rows = [["Risk level", "Count", "Share"]]
    for item in analytics.risk_distribution:
        distribution_rows.append(
            [
                _RISK_LABELS.get(item.risk_level, item.risk_level.title()),
                str(item.count),
                f"{item.percentage:.1f}%",
            ],
        )
    story.append(_styled_table(distribution_rows, [2.2 * inch, 1.5 * inch, 1.5 * inch]))
    story.append(Spacer(1, 0.15 * inch))

    story.append(Paragraph("Daily trend", section_style))
    if analytics.trend:
        trend_rows = [["Date", "Evaluations", "Average risk"]]
        for point in analytics.trend:
            trend_rows.append(
                [
                    point.date.isoformat(),
                    str(point.count),
                    f"{point.average_risk_percent:.2f}%",
                ],
            )
        story.append(_styled_table(trend_rows, [2.0 * inch, 1.75 * inch, 1.75 * inch]))
    else:
        story.append(Paragraph("No trend data for the selected period.", styles["Normal"]))

    story.append(Spacer(1, 0.25 * inch))
    story.append(
        Paragraph(
            "Clinical decision support report — for operational review only. "
            "Not a substitute for clinical judgment.",
            styles["Italic"],
        ),
    )

    doc.build(story)
    return buffer.getvalue()


def _styled_table(rows: list[list[str]], col_widths: list[float]) -> Table:
    table = Table(rows, colWidths=col_widths, hAlign="LEFT")
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0058bc")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("GRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#d9dadc")),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f5f6f7")]),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ],
        ),
    )
    return table
