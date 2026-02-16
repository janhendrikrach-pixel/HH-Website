import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { CheckCircle, XCircle, Trash2 } from 'lucide-react';

export function AdminBookings({ bookings, onUpdateStatus, onDelete, language }) {
  return (
    <div className="bg-charcoal border border-white/5 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-white/5 hover:bg-transparent">
            <TableHead className="text-gold font-teko uppercase">{language === 'de' ? 'Name' : 'Name'}</TableHead>
            <TableHead className="text-gold font-teko uppercase">Email</TableHead>
            <TableHead className="text-gold font-teko uppercase">{language === 'de' ? 'Datum' : 'Date'}</TableHead>
            <TableHead className="text-gold font-teko uppercase">Status</TableHead>
            <TableHead className="text-gold font-teko uppercase">{language === 'de' ? 'Aktionen' : 'Actions'}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((booking) => (
            <TableRow key={booking.id} className="border-white/5">
              <TableCell className="font-rajdhani text-white">
                {booking.first_name} {booking.last_name}
              </TableCell>
              <TableCell className="font-rajdhani text-gray-400">{booking.email}</TableCell>
              <TableCell className="font-rajdhani text-gray-400">{booking.preferred_date}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 text-xs font-rajdhani ${
                  booking.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                  booking.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {booking.status}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <button
                    onClick={() => onUpdateStatus(booking.id, 'confirmed')}
                    className="p-1 text-green-400 hover:text-green-300"
                    title="Confirm"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onUpdateStatus(booking.id, 'cancelled')}
                    className="p-1 text-red-400 hover:text-red-300"
                    title="Cancel"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(booking.id)}
                    className="p-1 text-gray-400 hover:text-red-400"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {bookings.length === 0 && (
        <p className="text-center text-gray-500 font-rajdhani py-8">
          {language === 'de' ? 'Keine Buchungen vorhanden' : 'No bookings yet'}
        </p>
      )}
    </div>
  );
}
