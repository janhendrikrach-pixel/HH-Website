import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useLanguage } from '../lib/LanguageContext';
import { Calendar, MapPin, Clock, Ticket, ArrowLeft, CheckCircle, CreditCard, Building2 } from 'lucide-react';
import axios from 'axios';

const API = process.env.REACT_APP_BACKEND_URL;

export default function EventDetailPage() {
  const { eventId } = useParams();
  const { language } = useLanguage();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);
  const [bookingDone, setBookingDone] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ customer_name: '', customer_email: '', customer_phone: '', quantity: 1, payment_method: '' });
  const de = language === 'de';

  useEffect(() => {
    axios.get(`${API}/api/events/${eventId}`).then(r => setEvent(r.data)).catch(console.error).finally(() => setLoading(false));
  }, [eventId]);

  const handleBooking = async () => {
    if (!form.customer_name || !form.customer_email || !form.payment_method) return;
    setSubmitting(true);
    try {
      const res = await axios.post(`${API}/api/tickets/reserve`, { event_id: eventId, ...form });
      setBookingDone(res.data);
      if (form.payment_method === 'transfer') {
        const pi = await axios.get(`${API}/api/payment-info`);
        setPaymentInfo(pi.data);
      }
    } catch (err) {
      alert(err.response?.data?.detail || 'Fehler bei der Reservierung');
    } finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="min-h-screen bg-obsidian">
      <Navbar />
      <div className="flex justify-center pt-40"><div className="w-10 h-10 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /></div>
    </div>
  );

  if (!event) return (
    <div className="min-h-screen bg-obsidian">
      <Navbar />
      <div className="text-center pt-40">
        <p className="font-teko text-2xl text-gray-500">{de ? 'Event nicht gefunden' : 'Event not found'}</p>
        <Link to="/veranstaltungen" className="font-rajdhani text-gold mt-4 inline-block">{de ? 'Zurück' : 'Back'}</Link>
      </div>
    </div>
  );

  const soldOut = event.tickets_remaining !== null && event.tickets_remaining <= 0;

  // Booking confirmation view
  if (bookingDone) {
    return (
      <div className="min-h-screen bg-obsidian">
        <Navbar />
        <main className="pt-28 pb-20 px-4 sm:px-6 max-w-2xl mx-auto">
          <div className="bg-charcoal border border-gold/30 rounded-2xl p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h2 className="font-teko text-3xl text-white mb-2">{de ? 'Reservierung bestätigt!' : 'Reservation confirmed!'}</h2>
            <p className="font-rajdhani text-gray-400 mb-6">
              {de ? 'Eine Bestätigungs-E-Mail wurde gesendet.' : 'A confirmation email has been sent.'}
            </p>
            {/* Ticket codes */}
            <div className="space-y-3 mb-6">
              {bookingDone.tickets.map(t => (
                <div key={t.id} className="flex items-center justify-between bg-obsidian border border-white/10 rounded-xl p-4">
                  <div>
                    <p className="font-teko text-lg text-gold">{t.ticket_code}</p>
                    <p className="font-rajdhani text-gray-500 text-xs">{t.price.toFixed(2)} EUR</p>
                  </div>
                  <a href={`${API}/api/tickets/${t.id}/pdf`} target="_blank" rel="noreferrer"
                    data-testid={`download-ticket-${t.id}`}
                    className="flex items-center gap-1.5 px-4 py-2 bg-gold text-obsidian font-rajdhani text-sm rounded-lg hover:bg-gold-glow transition-colors">
                    <Ticket className="w-4 h-4" />PDF
                  </a>
                </div>
              ))}
            </div>
            {/* Transfer details */}
            {paymentInfo && form.payment_method === 'transfer' && (
              <div className="bg-obsidian border border-gold/20 rounded-xl p-6 text-left mb-6">
                <h3 className="font-teko text-lg text-gold mb-3">{de ? 'Überweisungsdaten' : 'Bank Transfer Details'}</h3>
                <div className="space-y-2 font-rajdhani text-sm">
                  {[
                    [de ? 'Empfänger' : 'Recipient', paymentInfo.account_holder],
                    ['Bank', paymentInfo.bank_name],
                    ['IBAN', paymentInfo.iban],
                    ['BIC', paymentInfo.bic],
                    [de ? 'Betrag' : 'Amount', `${(event.ticket_price * form.quantity).toFixed(2)} EUR`],
                    [de ? 'Verwendungszweck' : 'Reference', `${paymentInfo.reference_prefix}${bookingDone.tickets[0].ticket_code}`],
                  ].map(([label, val]) => val ? (
                    <div key={label} className="flex justify-between">
                      <span className="text-gray-500">{label}:</span>
                      <span className="text-white font-medium">{val}</span>
                    </div>
                  ) : null)}
                </div>
              </div>
            )}
            <Link to="/veranstaltungen" className="font-rajdhani text-gold hover:text-gold-glow">
              {de ? 'Zurück zu Veranstaltungen' : 'Back to Events'}
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-obsidian">
      <Navbar />
      <main className="pt-28 pb-20 px-4 sm:px-6 max-w-4xl mx-auto">
        <Link to="/veranstaltungen" className="flex items-center gap-2 font-rajdhani text-gold mb-6 hover:text-gold-glow transition-colors">
          <ArrowLeft className="w-4 h-4" />{de ? 'Alle Veranstaltungen' : 'All Events'}
        </Link>

        {event.image_url && (
          <div className="aspect-video rounded-2xl overflow-hidden mb-8">
            <img src={event.image_url} alt={de ? event.title_de : (event.title_en || event.title_de)} className="w-full h-full object-cover" />
          </div>
        )}

        <h1 data-testid="event-detail-title" className="font-teko text-4xl sm:text-5xl text-white mb-4">
          {de ? event.title_de : (event.title_en || event.title_de)}
        </h1>

        <div className="flex flex-wrap gap-5 mb-8">
          <span className="flex items-center gap-2 font-rajdhani text-gray-300"><Calendar className="w-4 h-4 text-gold" />{event.date}</span>
          {event.time && <span className="flex items-center gap-2 font-rajdhani text-gray-300"><Clock className="w-4 h-4 text-gold" />{event.time}</span>}
          {event.location && <span className="flex items-center gap-2 font-rajdhani text-gray-300"><MapPin className="w-4 h-4 text-gold" />{event.location}</span>}
        </div>

        <div className="font-rajdhani text-gray-300 leading-relaxed whitespace-pre-line mb-10">
          {de ? event.description_de : (event.description_en || event.description_de)}
        </div>

        {/* Ticket Section */}
        {event.ticket_price > 0 && (
          <div className="bg-charcoal border border-white/10 rounded-2xl p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-teko text-2xl text-gold">{de ? 'Tickets' : 'Tickets'}</h3>
                <p className="font-teko text-3xl text-white">{event.ticket_price.toFixed(2)} EUR</p>
              </div>
              {event.tickets_remaining !== null && (
                <span className={`font-rajdhani text-sm px-3 py-1.5 rounded-lg ${soldOut ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                  {soldOut ? (de ? 'Ausverkauft' : 'Sold out') : `${event.tickets_remaining} ${de ? 'verfügbar' : 'available'}`}
                </span>
              )}
            </div>

            {!soldOut && !showBooking && (
              <button data-testid="book-tickets-btn" onClick={() => setShowBooking(true)}
                className="w-full py-3.5 bg-gold text-obsidian font-teko text-lg uppercase tracking-wider rounded-xl hover:bg-gold-glow transition-colors">
                {de ? 'Tickets reservieren' : 'Reserve Tickets'}
              </button>
            )}

            {showBooking && (
              <div data-testid="booking-form" className="space-y-4 mt-4">
                <div>
                  <label className="font-rajdhani text-gray-400 text-sm block mb-1">Name *</label>
                  <input data-testid="booking-name" value={form.customer_name} onChange={e => setForm(p => ({ ...p, customer_name: e.target.value }))}
                    className="w-full bg-obsidian border border-white/10 rounded-xl px-4 py-3 font-rajdhani text-white focus:outline-none focus:border-gold/50" />
                </div>
                <div>
                  <label className="font-rajdhani text-gray-400 text-sm block mb-1">E-Mail *</label>
                  <input data-testid="booking-email" type="email" value={form.customer_email} onChange={e => setForm(p => ({ ...p, customer_email: e.target.value }))}
                    className="w-full bg-obsidian border border-white/10 rounded-xl px-4 py-3 font-rajdhani text-white focus:outline-none focus:border-gold/50" />
                </div>
                <div>
                  <label className="font-rajdhani text-gray-400 text-sm block mb-1">{de ? 'Telefon' : 'Phone'}</label>
                  <input data-testid="booking-phone" value={form.customer_phone} onChange={e => setForm(p => ({ ...p, customer_phone: e.target.value }))}
                    className="w-full bg-obsidian border border-white/10 rounded-xl px-4 py-3 font-rajdhani text-white focus:outline-none focus:border-gold/50" />
                </div>
                <div>
                  <label className="font-rajdhani text-gray-400 text-sm block mb-1">{de ? 'Anzahl' : 'Quantity'}</label>
                  <select data-testid="booking-quantity" value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: parseInt(e.target.value) }))}
                    className="w-full bg-obsidian border border-white/10 rounded-xl px-4 py-3 font-rajdhani text-white focus:outline-none appearance-none">
                    {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-rajdhani text-gray-400 text-sm block mb-2">{de ? 'Zahlungsmethode' : 'Payment Method'} *</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button data-testid="payment-box-office" onClick={() => setForm(p => ({ ...p, payment_method: 'box_office' }))}
                      className={`flex flex-col items-center gap-2 p-4 border rounded-xl transition-all ${form.payment_method === 'box_office' ? 'border-gold bg-gold/10' : 'border-white/10 hover:border-white/20'}`}>
                      <CreditCard className={`w-6 h-6 ${form.payment_method === 'box_office' ? 'text-gold' : 'text-gray-500'}`} />
                      <span className={`font-rajdhani text-sm ${form.payment_method === 'box_office' ? 'text-gold' : 'text-gray-400'}`}>
                        {de ? 'Abendkasse' : 'Box Office'}
                      </span>
                    </button>
                    <button data-testid="payment-transfer" onClick={() => setForm(p => ({ ...p, payment_method: 'transfer' }))}
                      className={`flex flex-col items-center gap-2 p-4 border rounded-xl transition-all ${form.payment_method === 'transfer' ? 'border-gold bg-gold/10' : 'border-white/10 hover:border-white/20'}`}>
                      <Building2 className={`w-6 h-6 ${form.payment_method === 'transfer' ? 'text-gold' : 'text-gray-500'}`} />
                      <span className={`font-rajdhani text-sm ${form.payment_method === 'transfer' ? 'text-gold' : 'text-gray-400'}`}>
                        {de ? 'Überweisung' : 'Bank Transfer'}
                      </span>
                    </button>
                  </div>
                </div>
                {/* Total */}
                <div className="flex justify-between items-center pt-4 border-t border-white/10">
                  <span className="font-rajdhani text-gray-400">{de ? 'Gesamt' : 'Total'}:</span>
                  <span className="font-teko text-2xl text-gold">{(event.ticket_price * form.quantity).toFixed(2)} EUR</span>
                </div>
                <button data-testid="confirm-booking-btn" onClick={handleBooking}
                  disabled={submitting || !form.customer_name || !form.customer_email || !form.payment_method}
                  className="w-full py-3.5 bg-gold text-obsidian font-teko text-lg uppercase tracking-wider rounded-xl disabled:opacity-40 hover:bg-gold-glow transition-colors">
                  {submitting ? '...' : (de ? 'Jetzt reservieren' : 'Reserve Now')}
                </button>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
