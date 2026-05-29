'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { getTasks } from '@/services/taskService';
import { ITask } from '@/types';
import { CalendarIcon, Download, Loader2, Sparkles, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Label } from '@/components/ui/label';

export default function DownloadReportPage() {
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>();
  const [generating, setGenerating] = useState(false);

  const handleGenerateReport = async () => {
    if (!fromDate || !toDate) {
      toast.error('Please select both from and to dates');
      return;
    }
    
    if (fromDate > toDate) {
      toast.error('From date must be before To date');
      return;
    }

    setGenerating(true);
    const loadingToast = toast.loading('Fetching data and generating AI report...');

    try {
      // 1. Fetch tasks
      const res = await getTasks(1, 1000, fromDate.toISOString(), toDate.toISOString());
      const tasks = res.data || [];
      
      if (tasks.length === 0) {
        toast.dismiss(loadingToast);
        toast.info('No tasks found in the selected date range.');
        setGenerating(false);
        return;
      }

      // 2. Generate AI Summary using Gemini
      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `Write a professional internship progress report for the intern at Majesto Limited. 
Highlight achievements, skills demonstrated, and positive contributions based on the following tasks. 
Make it glowing and professional. Format as a proper report with these EXACT sections (use these headers): 
"Overview", "Key Achievements", "Skills Demonstrated", "Notable Work".
Do not use markdown formatting like asterisks or hash symbols, just plain text with newlines separating sections.

Task Data:
${JSON.stringify(tasks.map((t: ITask) => ({ date: t.date, tasks: t.tasks, notes: t.note })))}`;

      const aiResult = await model.generateContent(prompt);
      const aiText = aiResult.response.text();

      // 3. Generate PDF
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Header
      doc.setFontSize(22);
      doc.setTextColor(30, 58, 138); // Indigo 900
      doc.text('Majesto Limited', pageWidth / 2, 20, { align: 'center' });
      
      doc.setFontSize(16);
      doc.setTextColor(71, 85, 105); // Slate 600
      doc.text('Internship Progress Report', pageWidth / 2, 30, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setTextColor(100, 116, 139); // Slate 500
      doc.text(`Period: ${format(fromDate, 'MMM dd, yyyy')} - ${format(toDate, 'MMM dd, yyyy')}`, pageWidth / 2, 40, { align: 'center' });
      
      doc.setDrawColor(226, 232, 240); // Slate 200
      doc.line(20, 45, pageWidth - 20, 45);

      // AI Summary Sections
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42); // Slate 900
      
      const sections = aiText.split(/(?=Overview|Key Achievements|Skills Demonstrated|Notable Work)/i).filter(s => s.trim());
      
      let yPos = 55;
      
      sections.forEach(section => {
        const lines = doc.splitTextToSize(section.trim(), pageWidth - 40);
        // Check if we need a new page
        if (yPos + (lines.length * 5) > 280) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(lines, 20, yPos);
        yPos += (lines.length * 5) + 10;
      });

      // Tasks Table
      doc.addPage();
      doc.setFontSize(14);
      doc.setTextColor(30, 58, 138);
      doc.text('Detailed Task Log', 20, 20);
      
      const tableData = tasks.map((t: ITask) => [
        format(new Date(t.date), 'MMM dd, yyyy'),
        t.tasks.map((task, i) => `${i + 1}. ${task}`).join('\n'),
        t.note || '-',
        t.driveLink || '-'
      ]);

      autoTable(doc, {
        startY: 30,
        head: [['Date', 'Tasks', 'Notes', 'Drive Link']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229] }, // Indigo 600
        styles: { fontSize: 9, cellPadding: 4 },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: 80 },
          2: { cellWidth: 40 },
          3: { cellWidth: 40, overflow: 'linebreak' }
        }
      });

      // Save PDF
      doc.save(`Majesto_Report_${format(fromDate, 'yyyy-MM-dd')}_to_${format(toDate, 'yyyy-MM-dd')}.pdf`);
      
      toast.dismiss(loadingToast);
      toast.success('Report generated successfully!');

    } catch (error) {
      console.error(error);
      toast.dismiss(loadingToast);
      toast.error('Failed to generate report. Check API keys or try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto mt-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">Download AI Report</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Generate a comprehensive, AI-summarized PDF report of internship progress.
        </p>
      </div>

      <Card className="bg-slate-900 border-slate-800 shadow-xl overflow-hidden relative">
        {/* Background glow */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl" />
        
        <CardHeader className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl border border-indigo-500/30">
              <Sparkles className="h-6 w-6 text-indigo-400" />
            </div>
            <div>
              <CardTitle className="text-white text-xl">Report Configuration</CardTitle>
              <CardDescription className="text-slate-400">Select a date range to summarize tasks</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-8 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-slate-300">From Date</Label>
              <Popover>
                <PopoverTrigger render={
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-medium bg-slate-800/50 border-slate-700 hover:bg-slate-800 hover:text-white",
                      !fromDate && "text-slate-500"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-indigo-400" />
                    {fromDate ? format(fromDate, "PPP") : <span>Pick start date</span>}
                  </Button>
                } />
                <PopoverContent className="w-auto p-0 bg-slate-900 border-slate-800" align="start">
                  <Calendar
                    mode="single"
                    selected={fromDate}
                    onSelect={setFromDate}
                    autoFocus
                    className="bg-slate-900 text-white border-slate-800"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">To Date</Label>
              <Popover>
                <PopoverTrigger render={
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-medium bg-slate-800/50 border-slate-700 hover:bg-slate-800 hover:text-white",
                      !toDate && "text-slate-500"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-indigo-400" />
                    {toDate ? format(toDate, "PPP") : <span>Pick end date</span>}
                  </Button>
                } />
                <PopoverContent className="w-auto p-0 bg-slate-900 border-slate-800" align="start">
                  <Calendar
                    mode="single"
                    selected={toDate}
                    onSelect={setToDate}
                    autoFocus
                    className="bg-slate-900 text-white border-slate-800"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/80">
            <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-indigo-400" /> What's included in the report?
            </h4>
            <ul className="text-sm text-slate-400 space-y-1 list-disc list-inside">
              <li>AI-generated professional summary of achievements</li>
              <li>Breakdown of skills demonstrated</li>
              <li>Complete chronological log of all tasks</li>
              <li>Links to referenced Google Drive assets</li>
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
