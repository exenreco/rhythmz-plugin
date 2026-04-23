const { useState, useEffect } = wp.element;
const { registerPlugin } = wp.plugins;
const { PluginSidebar } = wp.editPost;
const { select, dispatch } = wp.data;
const { PanelBody, Button, TextControl } = wp.components;

// ----------------------------------------
// PREBUILT TEMPLATES
// ----------------------------------------
const PREBUILT_TEMPLATES = [
  { name: "General Admission (Early Bird)", price: "10.00", stock: 10 },
  { name: "General Admission (Standard Access)", price: "15.00", stock: 20 },
  { name: "Luxury VIP", price: "680.00", stock: 1 },
  // ... add remaining templates here
];

// ----------------------------------------
// Ticket Generator Component
// ----------------------------------------
const TicketGenerator = () => {
  const 
  [tickets, setTickets] = useState([PREBUILT_TEMPLATES[0]]),
  [loading, setLoading] = useState(false),

  // Add blank ticket
  addTicket = () => setTickets([...tickets, { name: "", price: "", stock: 0 }]),

  // Update ticket field
  updateTicket = (index, field, value) => {
    const updated = [...tickets];
    updated[index][field] = value;
    setTickets(updated);
  },

  // Load prebuilt templates
  loadTemplates = () => {
    setTickets(prevTickets => {
      const combined = [...prevTickets, ...PREBUILT_TEMPLATES];
      return combined.filter((t, index, self) =>
        index === self.findIndex(tt => tt.name === t.name)
      );
    });
  },

  // ----------------------------------------
  // REST call to generate tickets
  // ----------------------------------------
  generateTickets = async () => {
    if (loading) return;

    const editor = select("core/editor");
    const eventId = editor.getCurrentPostId();

    if (!eventId || editor.isEditedPostNew() || editor.isSavingPost() || editor.isAutosavingPost()) {
      alert("Please save your event as a draft first.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${wpApiSettings.root}ticketgen/v1/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-WP-Nonce": wpApiSettings.nonce,
        },
        body: JSON.stringify({ event_id: eventId, templates: tickets }),
      });

      if (!res.ok) {
        const errorText = await res.text(); // This captures the HTML error from WP
        console.error("Server Error Response:", errorText);
        alert("Server error. Look at the browser console 'Network' tab for details.");
        setLoading(false);
        return;
      }

      const data = await res.json();
      if (!data.tickets) {
        alert("Error generating tickets");
        setLoading(false);
        return;
      }

      injectTickets(data.tickets);

    } catch (e) {
      console.error(e);
    }

    setLoading(false);
  },

  // ----------------------------------------
  // Inject tickets into TEC store
  // ----------------------------------------
  injectTickets = async (ticketsFromServer) => {
    // Ensure the Tickets Block exists first
    const blocks = select("core/block-editor").getBlocks(),
      hasTicketsBlock = blocks.some(
        (b) =>
          b.name === "tribe/tickets" ||
          (b.innerBlocks &&
            b.innerBlocks.some((inner) => inner.name === "tribe/tickets")),
      );

    if (!hasTicketsBlock) {
      console.log("Tickets block missing. Inserting...");
      const ticketsBlock = wp.blocks.createBlock("tribe/tickets", {
        capacity_mode: "individual",
      });
      dispatch("core/block-editor").insertBlocks(ticketsBlock);

      // Wait for the block to register the store
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // 2. Dynamic Store Detection (Try to find the store up to 5 times)
    let 
    attempts = 0,
    ticketStore = dispatch("tribe/tickets");

    while (!ticketStore && attempts < 5) {
      console.log(`Attempt ${attempts + 1}: Searching for TEC store...`);
      await new Promise((resolve) => setTimeout(resolve, 500));
      ticketStore = dispatch("tribe/tickets");
      attempts++;
    }

    if (!ticketStore) {
      alert(
        "TEC Ticket Store not found. Please ensure the 'Tickets' block is added to the page and try again.",
      );
      return;
    }

    // 3. Normalized Ticket Data
    const normalized = ticketsFromServer.map((t) => ({
      id: Number(t.id),
      name: t.name,
      price: t.price || "0.00",
      stock: Number(t.stock),
      capacity: Number(t.stock),
      capacity_mode: "individual",
      stock_mode: "own",
      manage_stock: true,
      provider: "woo",
      admin_label: t.name,
      hasBeenCreated: true, // Tells TEC this is an existing ticket
      isNew: false,
    }));

    // 4. Inject
    try {
      // Hybrid injection: small batch -> addTicket, large batch -> setTickets
      if (normalized.length < 20) {
        normalized.forEach((ticket) => ticketStore.addTicket(ticket));
      } else {
        const currentTickets = select("tribe/tickets")?.getTickets?.() || [];
        ticketStore.setTickets([...currentTickets, ...normalized]);
      }
      console.log("✅ Tickets injected successfully");
      alert(`${normalized.length} tickets generated and added to the editor.`);
    } catch (err) {
      console.error("Injection failed:", err);
    }

    if (!ticketStore) {
      console.error(
        "TEC store still not available. Is Event Tickets Plus active?",
      );
      alert(
        "Could not find the Ticket data store. Try adding a 'Tickets' block manually first.",
      );
      return;
    }

    console.log("✅ Tickets injected into TEC store");
  };

  // ----------------------------------------
  // Render Sidebar
  // ----------------------------------------
  return (
    <PluginSidebar name="ticket-gen-sidebar" title="🎟 Ticket Generator">
      <PanelBody title="Tickets" initialOpen={true}>
        <Button isSecondary onClick={loadTemplates} style={{ marginBottom: "10px" }}>
          📥 Load Ticket Presets
        </Button>

        {tickets.map((t, i) => (
          <div key={i} style={{ marginBottom: "10px", border: "1px solid #eee", padding: "8px", borderRadius: "4px" }}>
            <TextControl label="Name" value={t.name} onChange={v => updateTicket(i, "name", v)} />
            <TextControl label="Price" value={t.price} onChange={v => updateTicket(i, "price", v)} />
            <TextControl label="Stock" value={t.stock} onChange={v => updateTicket(i, "stock", parseInt(v || 0))} />
            <Button isLink isDestructive onClick={() => setTickets(tickets.filter((_, idx) => idx !== i))} style={{ marginTop: "4px" }}>
              ❌ Remove
            </Button>
          </div>
        ))}

        <Button isSecondary onClick={addTicket}>➕ Add Ticket</Button>
        <Button isPrimary isBusy={loading} onClick={generateTickets} style={{ marginTop: "10px" }} disabled={tickets.length === 0}>
          ⚡ Generate Tickets
        </Button>
      </PanelBody>
    </PluginSidebar>
  );
};

// ----------------------------------------
// Register Plugin
// ----------------------------------------
registerPlugin("ticket-generator", { render: TicketGenerator });
