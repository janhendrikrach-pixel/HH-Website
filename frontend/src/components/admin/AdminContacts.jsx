import React from 'react';
import { Eye, Trash2 } from 'lucide-react';

export function AdminContacts({ contacts, onMarkRead, onDelete, language }) {
  return (
    <div className="space-y-4">
      {contacts.map((contact) => (
        <div
          key={contact.id}
          className={`bg-charcoal border p-6 ${contact.is_read ? 'border-white/5' : 'border-gold/30'}`}
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h4 className="font-teko text-xl text-white">{contact.name}</h4>
              <p className="font-rajdhani text-gold text-sm">{contact.email}</p>
            </div>
            <div className="flex gap-2">
              {!contact.is_read && (
                <button
                  onClick={() => onMarkRead(contact.id)}
                  className="p-2 text-green-400 hover:text-green-300"
                  title="Mark as read"
                >
                  <Eye className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => onDelete(contact.id)}
                className="p-2 text-gray-400 hover:text-red-400"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          <p className="font-rajdhani text-gray-300">{contact.message}</p>
          <p className="font-rajdhani text-gray-500 text-sm mt-4">
            {new Date(contact.created_at).toLocaleString()}
          </p>
        </div>
      ))}
      {contacts.length === 0 && (
        <p className="text-center text-gray-500 font-rajdhani py-8">
          {language === 'de' ? 'Keine Nachrichten vorhanden' : 'No messages yet'}
        </p>
      )}
    </div>
  );
}
