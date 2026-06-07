"use client";

import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
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
import { OWNER_NAME } from "@/constants";

export default function DownloadReportPage() {
    const [fromDate, setFromDate] = useState<Date | undefined>();
    const [toDate, setToDate] = useState<Date | undefined>();
    const [generating, setGenerating] = useState(false);

    const handleGenerateReport = async () => {
        if (!fromDate || !toDate) {
            toast.error("Please select both from and to dates");
            return;
        }

        if (fromDate > toDate) {
            toast.error("From date must be before To date");
            return;
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
                fromDate.toISOString(),
                toDate.toISOString(),
            );
            const tasks = res.data || [];

            if (tasks.length === 0) {
                toast.dismiss(loadingToast);
                toast.info("No tasks found in the selected date range.");
                setGenerating(false);
                return;
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
                `Period: ${format(fromDate, "MMM dd, yyyy")} - ${format(toDate, "MMM dd, yyyy")}`,
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
                const imageLinks = t.images && t.images.length > 0 ? t.images.map((img, i) => `Image ${i + 1}:\n${img}`).join("\n") : "-";
                let links = "";
                if (t.driveLink) links += `Drive: ${t.driveLink}\n`;
                if (imageLinks !== "-") links += `Images:\n${imageLinks}`;
                if (!links) links = "-";
                
                return [
                    format(new Date(t.date), "MMM dd, yyyy"),
                    t.tasks.map((task: string, i: number) => `${i + 1}. ${task}`).join("\n"),
                    t.note || "-",
                    links.trim()
                ];
            });

            autoTable(doc, {
                startY: 85,
                head: [["Date", "Tasks", "Notes", "Links"]],
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
            });

            // Save PDF
            doc.save(
                `Majesto_Report_${format(fromDate, "yyyy-MM-dd")}_to_${format(toDate, "yyyy-MM-dd")}.pdf`,
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
                                        className="bg-white text-slate-900 border-slate-200"
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

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
