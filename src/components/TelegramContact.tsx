import type {ReactNode} from 'react';
import {ArrowUpRight, Send} from 'lucide-react';
import {telegramUrl} from '../lib/telegram';
import './telegram.css';

export function TelegramLink({message, children, className = ''}: {
    message?: string;
    children?: ReactNode;
    className?: string
}) {
    return <a className={`telegram-link ${className}`} href={telegramUrl(message)} target="_blank"
              rel="noopener noreferrer"
              aria-label={`${typeof children === 'string' ? children : 'Chat on Telegram'} (opens in a new tab)`}><Send
        size={15} aria-hidden="true"/>{children || 'Chat on Telegram'}<ArrowUpRight size={14} aria-hidden="true"/></a>;
}

export function TelegramContact({message, context = 'bag'}: { message: string; context?: 'bag' | 'order' }) {
    return <div className="telegram-contact"><h3>A little help on Telegram</h3>
        <p>{context === 'order' ? 'Questions about your order? Open a chat with your order reference ready.' : 'Need help with your pieces or sizing? Talk to Little Stars on Telegram.'}</p>
        <TelegramLink message={message}/><small>Opens Telegram with a draft. You choose when to send. Your address and
            email aren’t included.</small></div>;
}
