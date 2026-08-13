import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;

const distPath = path.join(__dirname, 'dist');

// Supabase client
const supabaseUrl = 'https://gnpuiyxsqmfeolyxhmeghi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImducHVpeXNxbWZlb2xyaG1lZ2hpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1NzQ4NjIsImV4cCI6MjEwMjE1MDg2Mn0.0OcJwbGnURqWc7nLHWfRscTa0p7ANHpcY0skBlfW-Dg';
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(express.json());
app.use(express.static(distPath));

// ==================== API ROUTES ====================

// B2B Partners
app.get('/api/partners', async (req, res) => {
  try {
    const { data, error } = await supabase.from('b2b_partners').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/partners', async (req, res) => {
  try {
    const { company_name, tax_id, contact_person, email, phone, credit_limit } = req.body;
    const { data, error } = await supabase.from('b2b_partners').insert([{
      company_name, tax_id, contact_person, email, phone, credit_limit: credit_limit || 0
    }]).select();
    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Invoices
app.get('/api/invoices', async (req, res) => {
  try {
    const { data, error } = await supabase.from('invoices').select('*, b2b_partners(company_name)').order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/invoices', async (req, res) => {
  try {
    const { invoice_number, partner_id, issue_date, due_date, total_amount, payment_status } = req.body;
    const { data, error } = await supabase.from('invoices').insert([{
      invoice_number, partner_id, issue_date, due_date, total_amount: total_amount || 0, payment_status: payment_status || 'Unpaid'
    }]).select();
    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/invoices/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_status, total_amount } = req.body;
    const { data, error } = await supabase.from('invoices').update({ payment_status, total_amount }).eq('id', id).select();
    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bookings
app.get('/api/bookings', async (req, res) => {
  try {
    const { data, error } = await supabase.from('bookings').select('*, b2b_partners(company_name)').order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/bookings', async (req, res) => {
  try {
    const { booking_reference, partner_id, service_type, supplier_id, net_cost, gross_price, status, travel_date } = req.body;
    const { data, error } = await supabase.from('bookings').insert([{
      booking_reference, partner_id, service_type, supplier_id, net_cost, gross_price, status: status || 'Pending', travel_date
    }]).select();
    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Suppliers
app.get('/api/suppliers', async (req, res) => {
  try {
    const { data, error } = await supabase.from('suppliers').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Database connected to Supabase`);
});
