import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Trash2 } from 'lucide-react';

export function ScheduleManager({ schedule, onDelete, language }) {
  return (
    <div className="bg-charcoal border border-white/5 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-white/5 hover:bg-transparent">
            <TableHead className="text-gold font-teko uppercase">{language === 'de' ? 'Tag' : 'Day'}</TableHead>
            <TableHead className="text-gold font-teko uppercase">{language === 'de' ? 'Zeit' : 'Time'}</TableHead>
            <TableHead className="text-gold font-teko uppercase">{language === 'de' ? 'Titel' : 'Title'}</TableHead>
            <TableHead className="text-gold font-teko uppercase">{language === 'de' ? 'Aktionen' : 'Actions'}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schedule.map((item) => (
            <TableRow key={item.id} className="border-white/5">
              <TableCell className="font-rajdhani text-white">{language === 'de' ? item.day_de : item.day_en}</TableCell>
              <TableCell className="font-rajdhani text-gray-400">{item.time_start} - {item.time_end}</TableCell>
              <TableCell className="font-rajdhani text-gray-400">{language === 'de' ? item.title_de : item.title_en}</TableCell>
              <TableCell>
                <button
                  onClick={() => onDelete(item.id)}
                  className="p-1 text-gray-400 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {schedule.length === 0 && (
        <p className="text-center text-gray-500 font-rajdhani py-8">
          {language === 'de' ? 'Keine Trainingszeiten vorhanden' : 'No schedule entries yet'}
        </p>
      )}
    </div>
  );
}
