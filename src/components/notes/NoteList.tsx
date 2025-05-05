
import React, { useState } from "react";
import { format } from "date-fns";
import { Note, NoteCard } from "./NoteCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus, Filter } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// Sample notes data
const MOCK_NOTES: Note[] = [
  {
    id: "1",
    title: "Meeting with TechStartup Inc",
    content: "Discussed their growth strategy and upcoming Series A round. They're focusing on enterprise sales and have a pipeline of 3 major clients. We should follow up next month to see how the deals progress. The team is strong in technical execution but might need help with go-to-market strategy.",
    author: { id: "1", name: "Admin User" },
    companyId: "101",
    companyName: "TechStartup Inc",
    tags: ["meeting", "strategy", "funding"],
    visibility: "internal",
    createdAt: new Date(2023, 4, 15),
    attachments: [
      {
        id: "a1",
        filename: "pitch_deck_v2.pdf",
        type: "application/pdf",
        url: "#",
      },
    ],
  },
  {
    id: "2",
    title: "Due Diligence: CloudScale AI",
    content: "Technical assessment complete. Their ML models show impressive accuracy compared to competitors. Scalability concerns addressed with new architecture. Team has strong academic background but limited industry experience. Recommended to proceed with funding discussions.",
    author: { id: "1", name: "Admin User" },
    companyId: "102",
    companyName: "CloudScale AI",
    tags: ["due diligence", "technical", "AI"],
    visibility: "partner",
    createdAt: new Date(2023, 4, 10),
    attachments: [],
  },
  {
    id: "3",
    title: "Quarterly Review: DevSecOps Platform",
    content: "Q1 performance above projections. MRR increased by 18% vs targeted 15%. Cash burn is on track with forecasts. Team grew from 15 to 22 with key hires in engineering and sales. Enterprise contracts increased by 3.",
    author: { id: "2", name: "Venture Partner" },
    companyId: "103",
    companyName: "DevSecOps Platform",
    tags: ["quarterly", "metrics", "growth"],
    visibility: "founder",
    createdAt: new Date(2023, 4, 5),
    attachments: [
      {
        id: "a2",
        filename: "q1_financials.xlsx",
        type: "application/xlsx",
        url: "#",
      },
      {
        id: "a3",
        filename: "metrics_dashboard.pdf",
        type: "application/pdf",
        url: "#",
      },
    ],
  },
  {
    id: "4",
    title: "Competitor Analysis: DataMetrics",
    content: "Conducted market research on competitors in the analytics space. DataMetrics has unique advantages in data visualization and real-time processing. Main competitors are raising significantly more capital, so we need a capital-efficient growth strategy.",
    author: { id: "1", name: "Admin User" },
    companyId: "104",
    companyName: "DataMetrics",
    tags: ["market", "competition", "strategy"],
    visibility: "internal",
    createdAt: new Date(2023, 4, 1),
    attachments: [],
  },
];

const NoteList: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState<string>("");

  // Filter notes based on search term, visibility, and user role
  const filteredNotes = MOCK_NOTES.filter((note) => {
    // First filter by search term
    const matchesSearch =
      searchTerm === "" ||
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (note.companyName && note.companyName.toLowerCase().includes(searchTerm.toLowerCase()));

    // Then filter by visibility based on role
    let hasAccess = false;
    if (user?.role === 'admin') {
      // Admins can see all notes
      hasAccess = true;
    } else if (user?.role === 'partner') {
      // Partners can see notes marked for partners and founders
      hasAccess = note.visibility === 'partner' || note.visibility === 'founder';
    } else if (user?.role === 'founder') {
      // Founders can only see notes marked for founders
      hasAccess = note.visibility === 'founder';
      // And only for their company
      if (user.companyId && note.companyId) {
        hasAccess = hasAccess && note.companyId === user.companyId;
      }
    }

    // Apply visibility filter if set
    if (visibilityFilter && note.visibility !== visibilityFilter) {
      return false;
    }

    return matchesSearch && hasAccess;
  });

  // Sort notes by date (newest first)
  const sortedNotes = [...filteredNotes].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search notes..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
            <SelectTrigger className="w-40 h-9">
              <SelectValue placeholder="All visibility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All visibility</SelectItem>
              {user?.role === 'admin' && <SelectItem value="internal">Internal Only</SelectItem>}
              {(user?.role === 'admin' || user?.role === 'partner') && <SelectItem value="partner">Shared with Partners</SelectItem>}
              <SelectItem value="founder">Shared with Founders</SelectItem>
            </SelectContent>
          </Select>

          {(user?.role === 'admin' || user?.role === 'partner') && (
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Note
            </Button>
          )}
        </div>
      </div>

      {sortedNotes.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No notes match your search criteria.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Group notes by month */}
          {Object.entries(
            sortedNotes.reduce((groups, note) => {
              const month = format(note.createdAt, "MMMM yyyy");
              if (!groups[month]) groups[month] = [];
              groups[month].push(note);
              return groups;
            }, {} as Record<string, Note[]>)
          ).map(([month, notes]) => (
            <div key={month}>
              <h3 className="text-lg font-medium mb-3">{month}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {notes.map((note) => (
                  <NoteCard key={note.id} note={note} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NoteList;
