import {useState} from 'react';
import {ArrowRight, Check} from 'lucide-react';

export function Newsletter() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    return <section className="newsletter">
        <div className="container newsletter-inner">
            <div><p className="eyebrow">A LITTLE SOMETHING GOOD</p><h2>Good things, in your inbox.</h2><p>New
                collections, thoughtful stories, and a little inspiration.</p></div>
            <form noValidate onSubmit={e => {
                e.preventDefault();
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                    setError('Please enter a valid email address.');
                    return
                }
                setError('');
                setSuccess(true)
            }}>{success ? <div className="newsletter-success" role="status"><Check size={22}/>
                <div>You’re on the list.<small>Demo subscription — your email hasn’t been sent or stored.</small></div>
            </div> : <><label htmlFor="newsletter-email" className="sr-only">Your email address</label>
                <div className="newsletter-input"><input id="newsletter-email" type="email"
                                                         placeholder="Your email address" value={email}
                                                         onChange={e => setEmail(e.target.value)} aria-invalid={!!error}
                                                         aria-describedby={error ? 'newsletter-error' : undefined}/>
                    <button aria-label="Subscribe to newsletter" type="submit"><ArrowRight size={22}/></button>
                </div>
                {error && <p className="error" id="newsletter-error">{error}</p>}<small>Just the good stuff. Unsubscribe
                    anytime. Demo signup.</small></>}</form>
        </div>
    </section>
}
