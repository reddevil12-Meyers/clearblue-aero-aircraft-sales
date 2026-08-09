import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Plus, Newspaper, Pencil, Trash2, GripVertical, Loader2 } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function Announcements() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    base44.entities.Announcement.list('-sort_order', 200)
      .then(data => { setItems(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    await base44.entities.Announcement.delete(id);
    load();
  };

  const onDragEnd = async (result) => {
    if (!result.destination || result.destination.index === result.source.index) return;
    const reordered = Array.from(items);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setItems(reordered);

    setSaving(true);
    try {
      const updates = reordered.map((item, index) => ({
        id: item.id,
        sort_order: (reordered.length - index) * 10,
      }));
      await base44.entities.Announcement.bulkUpdate(updates);
    } catch (e) {
      load();
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Newspaper className="w-7 h-7 text-accent" />
          <h1 className="text-2xl font-display font-semibold">Announcements & News</h1>
          {saving && (
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving order…
            </span>
          )}
        </div>
        <Link
          to="/announcements/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-semibold hover:brightness-110 transition-all"
        >
          <Plus className="w-4 h-4" /> New Announcement
        </Link>
      </div>

      <p className="text-xs text-muted-foreground mb-4">Drag and drop rows to set the display order. The top item appears first on the public site.</p>

      {items.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Newspaper className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">No announcements yet</p>
          <p className="text-sm mt-1">Create your first announcement to display on the public site.</p>
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="announcements">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-4">
                {items.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(prov, snapshot) => (
                      <div
                        ref={prov.innerRef}
                        {...prov.draggableProps}
                        className={`bg-card rounded-xl border border-border p-5 flex gap-4 transition-shadow ${snapshot.isDragging ? 'shadow-lg border-accent/40' : ''}`}
                      >
                        <div {...prov.dragHandleProps} className="flex items-center self-stretch cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground">
                          <GripVertical className="w-5 h-5" />
                        </div>
                        <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted shrink-0">
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Newspaper className="w-8 h-8 text-muted-foreground/30" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <h2 className="text-lg font-semibold text-foreground truncate">{item.title}</h2>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className={`text-xs font-bold px-2 py-0.5 rounded ${item.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                {item.active ? 'Active' : 'Hidden'}
                              </span>
                              <Link to={`/announcements/${item.id}`} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                                <Pencil className="w-4 h-4" />
                              </Link>
                              <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.body || 'No content'}</p>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
}