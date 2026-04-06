"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Download, FileType, File } from "lucide-react"

interface Developer {
  id: string
  name: string
  monthlySalary: number
  workType: "hours" | "days"
  workAmount: number
}

interface ProjectInfo {
  projectName: string
  clientName: string
  invoiceDate: string
  primaryCurrency: "USD" | "BDT"
}

interface DownloadButtonProps {
  projectInfo: ProjectInfo
  developers: Developer[]
  effectiveWorkingHours: number
  baseCost: number
  officeCostPercent: number
  profitMarginPercent: number
  officeCost: number
  profitAmount: number
  totalCost: number
  totalUSD: number
  totalBDT: number
}

// Exchange rate constant
const USD_TO_BDT = 121

const formatCurrency = (amount: number, currency: "USD" | "BDT") => {
  if (currency === "USD") {
    return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  return `৳${amount.toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const formatDate = (dateString: string) => {
  if (!dateString) return "Not set"
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", { 
    year: "numeric", 
    month: "long", 
    day: "numeric" 
  })
}

const calculateHourlyRate = (monthlySalary: number, effectiveWorkingHours: number) => {
  const weeklyHours = effectiveWorkingHours * 5
  const monthlyHours = weeklyHours * 4.33
  return monthlySalary / monthlyHours
}

export function DownloadButton(props: DownloadButtonProps) {
  const formatPrimaryCurrency = (amount: number) => formatCurrency(amount, props.projectInfo.primaryCurrency)

  const handleDownloadPDF = async () => {
    const { default: jsPDF } = await import("jspdf")
    const doc = new jsPDF()
    let y = 20

    // Title
    doc.setFontSize(24)
    doc.setFont("helvetica", "bold")
    doc.text("INVOICE", 105, y, { align: "center" })
    y += 15

    // Project Info
    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    
    if (props.projectInfo.projectName) {
      doc.text(`Project: ${props.projectInfo.projectName}`, 20, y)
      y += 8
    }
    if (props.projectInfo.clientName) {
      doc.text(`Client: ${props.projectInfo.clientName}`, 20, y)
      y += 8
    }
    if (props.projectInfo.invoiceDate) {
      doc.text(`Date: ${formatDate(props.projectInfo.invoiceDate)}`, 20, y)
      y += 8
    }
    
    y += 10

    // Developer Details Header
    doc.setFont("helvetica", "bold")
    doc.text("Team Members", 20, y)
    y += 8

    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)

    // Developer table
    if (props.developers.length > 0) {
      props.developers.forEach((dev) => {
        const hourlyRate = calculateHourlyRate(dev.monthlySalary, props.effectiveWorkingHours)
        const hoursWorked = dev.workType === "days" 
          ? dev.workAmount * props.effectiveWorkingHours 
          : dev.workAmount
        const devCost = hoursWorked * hourlyRate

        doc.text(`${dev.name}`, 20, y)
        doc.text(`${hoursWorked.toFixed(1)} hrs @ ${formatPrimaryCurrency(hourlyRate)}/hr = ${formatPrimaryCurrency(devCost)}`, 80, y)
        y += 6
      })
    } else {
      doc.text("No developers added", 20, y)
      y += 6
    }

    y += 10

    // Cost Breakdown
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text("Cost Breakdown", 20, y)
    y += 10

    doc.setFont("helvetica", "normal")
    doc.text("Base Development Cost:", 20, y)
    doc.text(formatPrimaryCurrency(props.baseCost), 150, y, { align: "right" })
    y += 8

    doc.text(`Office Overhead (${props.officeCostPercent}%):`, 20, y)
    doc.text(formatPrimaryCurrency(props.officeCost), 150, y, { align: "right" })
    y += 8

    doc.text(`Profit Margin (${props.profitMarginPercent}%):`, 20, y)
    doc.text(formatPrimaryCurrency(props.profitAmount), 150, y, { align: "right" })
    y += 8

    // Line
    doc.setLineWidth(0.5)
    doc.line(20, y, 190, y)
    y += 8

    // Total
    doc.setFont("helvetica", "bold")
    doc.setFontSize(14)
    doc.text("TOTAL:", 20, y)
    doc.text(formatPrimaryCurrency(props.totalCost), 150, y, { align: "right" })
    y += 15

    // Dual Currency
    doc.setFontSize(11)
    doc.setFont("helvetica", "normal")
    doc.text(`USD: ${formatCurrency(props.totalUSD, "USD")}`, 20, y)
    doc.text(`BDT: ${formatCurrency(props.totalBDT, "BDT")}`, 110, y)
    y += 8
    doc.setFontSize(9)
    doc.text(`Exchange rate: $1 = ৳${USD_TO_BDT}`, 20, y)

    // Save
    const filename = props.projectInfo.projectName 
      ? `invoice-${props.projectInfo.projectName.toLowerCase().replace(/\s+/g, "-")}.pdf`
      : "invoice.pdf"
    doc.save(filename)
  }

  const handleDownloadWord = async () => {
    const docx = await import("docx")
    const { saveAs } = await import("file-saver")
    
    const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle } = docx

    const tableRows: InstanceType<typeof TableRow>[] = []

    // Header row
    tableRows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: "Description", bold: true })] })],
            width: { size: 70, type: WidthType.PERCENTAGE }
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: "Amount", bold: true })], alignment: AlignmentType.RIGHT })],
            width: { size: 30, type: WidthType.PERCENTAGE }
          })
        ]
      })
    )

    // Developer rows
    props.developers.forEach((dev) => {
      const hourlyRate = calculateHourlyRate(dev.monthlySalary, props.effectiveWorkingHours)
      const hoursWorked = dev.workType === "days" 
        ? dev.workAmount * props.effectiveWorkingHours 
        : dev.workAmount
      const devCost = hoursWorked * hourlyRate

      tableRows.push(
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: `${dev.name} (${hoursWorked.toFixed(1)} hrs @ ${formatPrimaryCurrency(hourlyRate)}/hr)` })]
            }),
            new TableCell({
              children: [new Paragraph({ text: formatPrimaryCurrency(devCost), alignment: AlignmentType.RIGHT })]
            })
          ]
        })
      )
    })

    // Subtotal
    tableRows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: "Base Development Cost", bold: true })] })]
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: formatPrimaryCurrency(props.baseCost), bold: true })], alignment: AlignmentType.RIGHT })]
          })
        ]
      })
    )

    // Office cost
    tableRows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ text: `Office Overhead (${props.officeCostPercent}%)` })]
          }),
          new TableCell({
            children: [new Paragraph({ text: formatPrimaryCurrency(props.officeCost), alignment: AlignmentType.RIGHT })]
          })
        ]
      })
    )

    // Profit
    tableRows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ text: `Profit Margin (${props.profitMarginPercent}%)` })]
          }),
          new TableCell({
            children: [new Paragraph({ text: formatPrimaryCurrency(props.profitAmount), alignment: AlignmentType.RIGHT })]
          })
        ]
      })
    )

    // Total
    tableRows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: "TOTAL", bold: true, size: 28 })] })],
            borders: {
              top: { style: BorderStyle.SINGLE, size: 2 }
            }
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: formatPrimaryCurrency(props.totalCost), bold: true, size: 28 })], alignment: AlignmentType.RIGHT })],
            borders: {
              top: { style: BorderStyle.SINGLE, size: 2 }
            }
          })
        ]
      })
    )

    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              children: [new TextRun({ text: "INVOICE", bold: true, size: 48 })],
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 }
            }),
            ...(props.projectInfo.projectName ? [new Paragraph({ text: `Project: ${props.projectInfo.projectName}`, spacing: { after: 100 } })] : []),
            ...(props.projectInfo.clientName ? [new Paragraph({ text: `Client: ${props.projectInfo.clientName}`, spacing: { after: 100 } })] : []),
            ...(props.projectInfo.invoiceDate ? [new Paragraph({ text: `Date: ${formatDate(props.projectInfo.invoiceDate)}`, spacing: { after: 400 } })] : []),
            new Paragraph({
              children: [new TextRun({ text: "Cost Breakdown", bold: true, size: 28 })],
              spacing: { before: 200, after: 200 }
            }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: tableRows
            }),
            new Paragraph({
              text: "",
              spacing: { before: 400 }
            }),
            new Paragraph({
              text: `USD: ${formatCurrency(props.totalUSD, "USD")}    |    BDT: ${formatCurrency(props.totalBDT, "BDT")}`,
              spacing: { after: 100 }
            }),
            new Paragraph({
              text: `Exchange rate: $1 = ৳${USD_TO_BDT}`,
              spacing: { after: 200 }
            })
          ]
        }
      ]
    })

    const blob = await Packer.toBlob(doc)
    const filename = props.projectInfo.projectName 
      ? `invoice-${props.projectInfo.projectName.toLowerCase().replace(/\s+/g, "-")}.docx`
      : "invoice.docx"
    saveAs(blob, filename)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 border-border bg-secondary text-foreground hover:bg-secondary/80">
          <Download className="h-4 w-4" />
          Download
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-popover border-border">
        <DropdownMenuItem onClick={handleDownloadPDF} className="gap-2 cursor-pointer">
          <FileType className="h-4 w-4" />
          Download as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDownloadWord} className="gap-2 cursor-pointer">
          <File className="h-4 w-4" />
          Download as Word
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
