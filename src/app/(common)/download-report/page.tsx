"use client";

import { useState } from "react";
import { toast } from "sonner";
import { format, endOfDay, startOfMonth, endOfMonth } from "date-fns";
import { getTasks } from "@/services/taskService";
import { ITask } from "@/types";
import {
    CalendarIcon,
    Download,
    Loader2,
    Sparkles,
    FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { OWNER_NAME } from "@/constants";

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

export default function DownloadReportPage() {
    type ReportType = "lifetime" | "monthly" | "range";
    const [reportType, setReportType] = useState<ReportType>("lifetime");
    const [selectedMonth, setSelectedMonth] = useState<string>(new Date().getMonth().toString());
    const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());

    const [fromDate, setFromDate] = useState<Date | undefined>();
    const [toDate, setToDate] = useState<Date | undefined>();
    const [generating, setGenerating] = useState(false);

    const handleGenerateReport = async () => {
        let finalFromDate: Date | undefined;
        let finalToDate: Date | undefined;
        let titlePeriod = "Lifetime";
        let fileNamePeriod = "Lifetime";

        if (reportType === "range") {
            if (!fromDate || !toDate) {
                toast.error("Please select both from and to dates");
                return;
            }
            if (fromDate > toDate) {
                toast.error("From date must be before To date");
                return;
            }
            finalFromDate = fromDate;
            finalToDate = endOfDay(toDate);
            titlePeriod = `Period: ${format(fromDate, "MMM dd, yyyy")} - ${format(toDate, "MMM dd, yyyy")}`;
            fileNamePeriod = `${format(fromDate, "yyyy-MM-dd")}_to_${format(toDate, "yyyy-MM-dd")}`;
        } else if (reportType === "monthly") {
            const year = parseInt(selectedYear, 10);
            const month = parseInt(selectedMonth, 10);
            finalFromDate = startOfMonth(new Date(year, month));
            finalToDate = endOfMonth(new Date(year, month));
            titlePeriod = `Period: ${MONTHS[month]} ${year}`;
            fileNamePeriod = `${MONTHS[month]}_${year}`;
        } else if (reportType === "lifetime") {
            finalFromDate = undefined;
            finalToDate = undefined;
            titlePeriod = "Period: Lifetime (All Data)";
            fileNamePeriod = "Lifetime";
        }

        setGenerating(true);
        const loadingToast = toast.loading(
            "Fetching data and generating report...",
        );

        try {
            // 1. Fetch tasks
            const res = await getTasks(
                1,
                1000,
                finalFromDate?.toISOString(),
                finalToDate?.toISOString(),
            );
            const tasks = res.data || [];

            if (tasks.length === 0) {
                toast.dismiss(loadingToast);
                toast.info("No tasks found in the selected date range.");
                setGenerating(false);
                return;
            }

            // Pre-fetch images
            const base64ImagesMap: Record<string, string[]> = {};
            for (const t of tasks) {
                if (t.images && t.images.length > 0) {
                    base64ImagesMap[t._id] = [];
                    for (const imgUrl of t.images) {
                        try {
                            const res = await fetch(imgUrl);
                            const blob = await res.blob();
                            const base64 = await new Promise<string>((resolve, reject) => {
                                const reader = new FileReader();
                                reader.onloadend = () => resolve(reader.result as string);
                                reader.onerror = reject;
                                reader.readAsDataURL(blob);
                            });
                            base64ImagesMap[t._id].push(base64);
                        } catch (e) {
                            console.error("Failed to load image for PDF", e);
                        }
                    }
                }
            }

            // 2. Generate PDF
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();

            // Header
            doc.setFontSize(22);
            doc.setTextColor(30, 58, 138); // Indigo 900
            doc.text("Majesto Limited", pageWidth / 2, 20, { align: "center" });

            doc.setFontSize(16);
            doc.setTextColor(71, 85, 105); // Slate 600
            doc.text(`Internship Progress Report of ${OWNER_NAME}`, pageWidth / 2, 30, {
                align: "center",
            });

            doc.setFontSize(12);
            doc.setTextColor(100, 116, 139); // Slate 500
            doc.text(
                titlePeriod,
                pageWidth / 2,
                40,
                { align: "center" },
            );

            // Summary Stats
            doc.setFontSize(11);
            doc.setTextColor(15, 23, 42); // Slate 900
            const totalTasks = tasks.reduce((sum: number, t: ITask) => sum + t.tasks.length, 0);
            doc.text(`Total working days: ${tasks.length}`, 20, 55);
            doc.text(`Total tasks completed: ${totalTasks}`, 20, 62);

            doc.setDrawColor(226, 232, 240); // Slate 200
            doc.line(20, 68, pageWidth - 20, 68);

            doc.setFontSize(14);
            doc.setTextColor(30, 58, 138);
            doc.text("Detailed Task Log", 20, 80);

            const tableData = tasks.map((t: ITask) => {
                return [
                    format(new Date(t.date), "MMM dd, yyyy"),
                    t.tasks.map((task: string, i: number) => `${i + 1}. ${task}`).join("\n"),
                    t.note || "-",
                    "", // Drawn manually
                    t.driveLink || "", // Index 4
                    t._id // Index 5
                ];
            });

            autoTable(doc, {
                startY: 85,
                head: [["Date", "Tasks", "Notes", "Links/Images"]],
                body: tableData,
                theme: "striped",
                headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: "bold" },
                styles: { fontSize: 9, cellPadding: 5, overflow: "linebreak" },
                columnStyles: {
                    0: { cellWidth: 25 },
                    1: { cellWidth: 65 },
                    2: { cellWidth: 40 },
                    3: { cellWidth: 50 },
                },
                didParseCell: (data) => {
                    if (data.column.index === 3 && data.section === "body") {
                        const rowData = data.row.raw as string[];
                        const driveLink = rowData[4];
                        const taskId = rowData[5];
                        const images = base64ImagesMap[taskId] || [];
                        
                        let requiredHeight = 10;
                        if (driveLink) {
                            requiredHeight += 12; // Space for "Drive" text
                        }
                        if (images.length > 0) {
                            const rowsOfImages = Math.ceil(images.length / 2);
                            requiredHeight += rowsOfImages * 22; 
                        }

                        if (requiredHeight === 10) {
                            data.cell.text = ["-"]; // Draw dash if nothing
                        }

                        if (data.cell.styles.minCellHeight < requiredHeight) {
                            data.cell.styles.minCellHeight = requiredHeight;
                        }
                    }
                },
                didDrawCell: (data) => {
                    if (data.column.index === 3 && data.section === "body") {
                        const rowData = data.row.raw as string[];
                        const driveLink = rowData[4];
                        const taskId = rowData[5];
                        const images = base64ImagesMap[taskId] || [];
                        
                        let yPos = data.cell.y + 5;
                        const xPos = data.cell.x + 5;

                        if (driveLink) {
                            doc.setFontSize(9);
                            doc.setTextColor(37, 99, 235); // Blue-600
                            doc.textWithLink("Drive", xPos, yPos + 4, { url: driveLink });
                            
                            const textWidth = doc.getTextWidth("Drive");
                            doc.setDrawColor(37, 99, 235);
                            doc.line(xPos, yPos + 5, xPos + textWidth, yPos + 5);
                            
                            yPos += 12;
                            doc.setTextColor(15, 23, 42); // Reset text color
                        }

                        if (images.length > 0) {
                            let imgX = xPos;
                            let imgY = yPos;
                            images.forEach((base64, i) => {
                                if (i > 0 && i % 2 === 0) {
                                    imgX = xPos;
                                    imgY += 22;
                                }
                                doc.addImage(base64, imgX, imgY, 20, 20);
                                imgX += 22;
                            });
                        }
                    }
                }
            });

            // Save PDF
            doc.save(
                `Majesto_Report_${fileNamePeriod}.pdf`,
            );

            toast.dismiss(loadingToast);
            toast.success("Report generated successfully!");
        } catch (error) {
            console.error(error);
            toast.dismiss(loadingToast);
            toast.error(
                "Failed to generate report. Check API keys or try again.",
            );
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="space-y-6 max-w-3xl mx-auto mt-8">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                    Download Report
                </h2>
                <p className="text-slate-500 mt-1">
                    Generate a comprehensive PDF report of your internship tasks and progress.
                </p>
            </div>

            <Card className="bg-white border-slate-200 shadow-sm shadow-slate-200/60 overflow-hidden relative">
                {/* Background glow */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl" />

                <CardHeader className="relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                            <Sparkles className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                            <CardTitle className="text-slate-900 text-xl">
                                Report Configuration
                            </CardTitle>
                            <CardDescription className="text-slate-500">
                                Select a date range to summarize tasks
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-8 relative z-10">
                    <div className="space-y-3">
                        <Label className="text-slate-700 font-semibold">Report Type</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <Button
                                variant={reportType === "lifetime" ? "default" : "outline"}
                                className={reportType === "lifetime" ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-white"}
                                onClick={() => setReportType("lifetime")}
                            >
                                Full Report (Lifetime)
                            </Button>
                            <Button
                                variant={reportType === "monthly" ? "default" : "outline"}
                                className={reportType === "monthly" ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-white"}
                                onClick={() => setReportType("monthly")}
                            >
                                Monthly
                            </Button>
                            <Button
                                variant={reportType === "range" ? "default" : "outline"}
                                className={reportType === "range" ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-white"}
                                onClick={() => setReportType("range")}
                            >
                                Custom Range
                            </Button>
                        </div>
                    </div>

                    {reportType === "range" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                            <Label className="text-slate-700">From Date</Label>
                            <Popover>
                                <PopoverTrigger
                                    render={
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-full justify-start text-left font-medium bg-white border-slate-200 hover:bg-slate-50 hover:text-slate-900",
                                                !fromDate && "text-slate-500",
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4 text-indigo-600" />
                                            {fromDate ? (
                                                format(fromDate, "PPP")
                                            ) : (
                                                <span>Pick start date</span>
                                            )}
                                        </Button>
                                    }
                                />
                                <PopoverContent
                                    className="w-auto p-0 bg-white border-slate-200"
                                    align="start"
                                >
                                    <Calendar
                                        mode="single"
                                        selected={fromDate}
                                        onSelect={setFromDate}
                                        autoFocus
                                        disabled={{ after: new Date() }}
                                        className="bg-white text-slate-900 border-slate-200"
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-slate-700">To Date</Label>
                            <Popover>
                                <PopoverTrigger
                                    render={
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-full justify-start text-left font-medium bg-white border-slate-200 hover:bg-slate-50 hover:text-slate-900",
                                                !toDate && "text-slate-500",
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4 text-indigo-600" />
                                            {toDate ? (
                                                format(toDate, "PPP")
                                            ) : (
                                                <span>Pick end date</span>
                                            )}
                                        </Button>
                                    }
                                />
                                <PopoverContent
                                    className="w-auto p-0 bg-white border-slate-200"
                                    align="start"
                                >
                                    <Calendar
                                        mode="single"
                                        selected={toDate}
                                        onSelect={setToDate}
                                        autoFocus
                                        disabled={{ after: new Date() }}
                                        className="bg-white text-slate-900 border-slate-200"
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                    )}

                    {reportType === "monthly" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-slate-700">Month</Label>
                                <Select value={selectedMonth} onValueChange={(val) => val !== null && setSelectedMonth(val)}>
                                    <SelectTrigger className="w-full bg-white border-slate-200 text-slate-900">
                                        <SelectValue placeholder="Select month">
                                            {selectedMonth ? MONTHS[parseInt(selectedMonth, 10)] : "Select month"}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border-slate-200 text-slate-900">
                                        {MONTHS.map((m, i) => (
                                            <SelectItem key={i} value={i.toString()}>{m}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-700">Year</Label>
                                <Select value={selectedYear} onValueChange={(val) => val !== null && setSelectedYear(val)}>
                                    <SelectTrigger className="w-full bg-white border-slate-200 text-slate-900">
                                        <SelectValue placeholder="Select year" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white border-slate-200 text-slate-900">
                                        {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i).map(y => (
                                            <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-2">
                            <FileText className="h-4 w-4 text-indigo-600" />{" "}
                            What's included in the report?
                        </h4>
                        <ul className="text-sm text-slate-500 space-y-1 list-disc list-inside">
                            <li>Summary of total days and tasks</li>
                            <li>Complete chronological log of all tasks</li>
                            <li>Included notes for each entry</li>
                            <li>Links to referenced Google Drive assets and images</li>
                        </ul>
                    </div>

                    <Button
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-xl shadow-indigo-500/25 h-12 text-base font-medium"
                        onClick={handleGenerateReport}
                        disabled={generating}
                    >
                        {generating ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Processing Data...
                            </>
                        ) : (
                            <>
                                <Download className="mr-2 h-5 w-5" />
                                Generate & Download PDF
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
