import type {FormEvent} from 'react';
import {useState} from 'react';
import {Link, useLocation} from 'react-router-dom';
import {ArrowRight, Check, ChevronDown, Heart, Leaf, Mail, MapPin, PackageCheck, Send, Star, Truck} from 'lucide-react';
import {TelegramLink} from '../components/TelegramContact';
import {Image} from '../components/Image';
import {config, money} from '../lib/config';
import './info.css';

type ContactForm = { name: string; email: string; subject: string; message: string };
const faqs = [
    {
        question: 'What is Little Stars?',
        answer: 'Little Stars is a thoughtfully curated clothing boutique for women, men, and kids. This storefront is a working demo: browse the collection, save your favorites, and try checkout without making a purchase.'
    },
    {
        question: 'How do I find the right size?',
        answer: 'Open the size guide on any product page for sample body measurements. Our pieces are designed with an easy, everyday fit. Choose a size and color to see the stock for that exact combination.'
    },
    {
        question: 'How much does shipping cost?',
        answer: `Standard demo shipping is ${money(config.standardShipping)}, or free on orders of ${money(config.freeShippingThreshold)} or more before discounts. Express shipping is ${money(config.expressShipping)}. Rates apply to the illustrative US checkout only; no actual shipment is created.`
    },
    {
        question: 'Can I return or exchange an item?',
        answer: 'In our sample policy, unworn pieces with their original tags can be returned within 30 days of delivery. This is a demo store, so no real purchases, returns, or exchanges are processed.'
    },
    {
        question: 'How does the demo discount work?',
        answer: `Enter STAR10 in your shopping bag for 10% off an eligible subtotal of ${money(config.couponMinimum)} or more. The offer applies to all products, including sale items. Only one coupon can be applied per order.`
    },
    {
        question: 'Will checkout charge my card?',
        answer: 'No. Demo checkout uses a simulated payment method and never asks for card details. No payment will be collected. After you place an order, a demo confirmation and order history are saved in this browser.'
    },
    {
        question: 'Do I need an account to checkout?',
        answer: 'You can check out as a guest. Our optional demo account lets you explore a sample profile and see orders stored on this device. There are no passwords or secure authentication.'
    },
    {
        question: 'Where are my favorites and orders saved?',
        answer: 'Your shopping bag, wishlist, profile, preferences, and demo orders are kept in localStorage in this browser. They are not synced across devices. Clearing browser site data will remove them.'
    },
];

export default function InfoPage() {
    const {pathname} = useLocation();
    if (pathname === '/about') return <About/>;
    if (pathname === '/contact') return <Contact/>;
    if (pathname === '/faq') return <div className="container info-page faq-page"><InfoHeading label="A little clarity"
                                                                                               title="Good questions. Thoughtful answers."
                                                                                               description="Everything you need to feel at home with Little Stars."/>
        <div className="faq-list">{faqs.map((faq, i) => <details key={faq.question} open={i === 0}>
            <summary>{faq.question}<ChevronDown size={17}/></summary>
            <p>{faq.answer}</p></details>)}</div>
        <div className="info-bottom-note"><Mail size={22}/>
            <div><h3>Something else on your mind?</h3><p>We’re always happy to help you find your way.</p></div>
            <Link to="/contact" className="text-link">Get in touch<ArrowRight size={16}/></Link></div>
    </div>;
    if (pathname === '/shipping-returns') return <Shipping/>;
    return <Policy kind={pathname === '/privacy' ? 'privacy' : 'terms'}/>;
}

function InfoHeading({label, title, description}: { label: string; title: string; description?: string }) {
    return <div className="page-heading info-heading"><span className="eyebrow">{label}</span>
        <h1>{title}</h1>{description && <p>{description}</p>}</div>
}

function About() {
    return <div className="info-page about-page">
        <div className="container"><InfoHeading label="The Little Stars story" title="For the moments that make a life."
                                                description="Thoughtfully chosen. Effortlessly worn. Loved a little longer."/>
            <div className="about-story">
                <div className="about-story-image"><Image src="/images/product-1.jpg"
                                                          alt="A relaxed linen shirt in warm, natural tones"/><span>A little more considered.</span>
                </div>
                <div className="about-story-copy"><span className="eyebrow">Less fuss. More feeling.</span><h2>Good
                    clothes.<br/>Even better days.</h2><p>There’s something special about the pieces you reach for again
                    and again. The shirt that softens with every wash. The knit that comes along on every weekend away.
                    The little outfit that keeps up with their biggest adventures.</p><p>Little Stars brings those
                    pieces together. A considered collection for women, men, and kids, chosen for natural textures, easy
                    shapes, and the kind of quiet details that make everyday dressing feel good.</p><p>We believe a
                    wardrobe should make room for real life. A slow morning. A spontaneous plan. The small, ordinary
                    moments that turn out to mean everything.</p><Link to="/shop" className="text-link">Find your
                    everyday favorites<ArrowRight size={17}/></Link></div>
            </div>
            <div className="about-values">
                <article><Leaf size={26} strokeWidth={1.4}/><h3>Thoughtfully selected</h3><p>Comfortable fabrics,
                    considered shapes, and pieces that work beautifully together.</p></article>
                <article><Heart size={26} strokeWidth={1.4}/><h3>Made for the everyday</h3><p>Clothes that feel as good
                    as they look, from the first coffee to the long way home.</p></article>
                <article><Star size={26} strokeWidth={1.4}/><h3>A little something special</h3><p>Quiet details and an
                    easy point of view. Beautiful things without the fuss.</p></article>
            </div>
            <p className="sample-copy-note">Little Stars is a fictional boutique and a working frontend demo. Product
                stories and brand statements are illustrative.</p></div>
        <div className="about-closing"><Star size={25} strokeWidth={1}/><h2>Everyday, a little extraordinary.</h2><Link
            className="btn" to="/collections/new-arrivals">Discover what’s new<ArrowRight size={17}/></Link></div>
    </div>
}

function Contact() {
    const [form, setForm] = useState<ContactForm>({name: '', email: '', subject: '', message: ''});
    const [errors, setErrors] = useState<Partial<Record<keyof ContactForm, string>>>({});
    const [success, setSuccess] = useState(false);
    const [busy, setBusy] = useState(false);

    async function submit(event: FormEvent) {
        event.preventDefault();
        const next: Partial<Record<keyof ContactForm,string
        >>= {};
        if (!form.name.trim()) next.name = 'Please enter your name.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = 'Please enter a valid email address.';
        if (!form.subject) next.subject = 'Please choose a topic.';
        if (form.message.trim().length < 10) next.message = 'Please write at least 10 characters.';
        setErrors(next);
        if (Object.keys(next).length) return;
        setBusy(true);
        await new Promise(resolve => setTimeout(resolve, 550));
        setBusy(false);
        setSuccess(true);
    }

    const update = (key: keyof ContactForm, value: string) => setForm({...form, [key]: value});
    return <div className="container info-page contact-page"><InfoHeading label="We’re here for you" title="Let’s talk."
                                                                          description="A question, a thought, or a little hello. We’d love to hear it."/>
        <div className="contact-layout">
            <aside className="contact-aside"><h2>A little help goes a long way.</h2><p>From finding your fit to
                understanding our collection, make yourself at home.</p>
                <div className="contact-detail"><Mail size={20}/>
                    <div><h3>Drop us a line</h3><a href="mailto:hello@littlestars.example">hello@littlestars.example</a>
                        <p>Sample email address for this demo.</p></div>
                </div>
                <div className="contact-detail"><Send size={20}/>
                    <div><h3>A little hello on Telegram</h3><TelegramLink/><p>Contact @LittleStarsShop directly.
                        Telegram opens in a new tab; you choose what to send.</p></div>
                </div>
                <div className="contact-detail"><MapPin size={20}/>
                    <div><h3>Inspired by everywhere</h3><p>An online boutique, made for your everyday.</p></div>
                </div>
                <div className="contact-help"><h3>Looking for a quick answer?</h3><p>Our FAQs cover sizing, shipping,
                    returns, and how this demo works.</p><Link className="text-link" to="/faq">Visit the FAQs<ArrowRight
                    size={16}/></Link></div>
            </aside>
            <section className="contact-form-panel">{success ?
                <div className="contact-success" role="status"><span><Check size={30}/></span><span className="eyebrow">Demo message complete</span>
                    <h2>A little hello, received.</h2><p>Your form passed validation. This is a simulated success — your
                        message hasn’t been sent or saved.</p>
                    <button className="btn-secondary" onClick={() => {
                        setSuccess(false);
                        setForm({name: '', email: '', subject: '', message: ''});
                        setErrors({});
                    }}>Write another message<ArrowRight size={16}/></button>
                </div> : <><h2>Send a little note.</h2><p className="contact-demo-note">Demo contact form. No data will
                    be sent or stored.</p>
                    <form onSubmit={submit} noValidate>
                        <div className="contact-two-fields">
                            <div className="field"><label htmlFor="contact-name">Your name</label><input
                                className="input" id="contact-name" autoComplete="name" value={form.name}
                                onChange={e => update('name', e.target.value)} placeholder="First and last name"
                                aria-invalid={!!errors.name}
                                aria-describedby={errors.name ? 'contact-name-error' : undefined}/>{errors.name &&
                                <span className="form-error" id="contact-name-error">{errors.name}</span>}</div>
                            <div className="field"><label htmlFor="contact-email">Email address</label><input
                                className="input" id="contact-email" type="email" autoComplete="email"
                                value={form.email} onChange={e => update('email', e.target.value)}
                                placeholder="you@example.com" aria-invalid={!!errors.email}
                                aria-describedby={errors.email ? 'contact-email-error' : undefined}/>{errors.email &&
                                <span className="form-error" id="contact-email-error">{errors.email}</span>}</div>
                        </div>
                        <div className="field"><label htmlFor="contact-subject">What’s on your mind?</label><select
                            className="input" id="contact-subject" value={form.subject}
                            onChange={e => update('subject', e.target.value)} aria-invalid={!!errors.subject}
                            aria-describedby={errors.subject ? 'contact-subject-error' : undefined}>
                            <option value="">Choose a topic</option>
                            <option value="products">Products & sizing</option>
                            <option value="shipping">Shipping & returns</option>
                            <option value="demo">Using the demo</option>
                            <option value="hello">Just saying hello</option>
                        </select>{errors.subject &&
                            <span className="form-error" id="contact-subject-error">{errors.subject}</span>}</div>
                        <div className="field"><label htmlFor="contact-message">Your message</label><textarea
                            className="input" rows={6} id="contact-message" value={form.message}
                            onChange={e => update('message', e.target.value)} placeholder="Tell us a little more…"
                            maxLength={3000} aria-invalid={!!errors.message}
                            aria-describedby={errors.message ? 'contact-message-error' : undefined}/>{errors.message &&
                            <span className="form-error" id="contact-message-error">{errors.message}</span>}</div>
                        <button className="btn" type="submit"
                                disabled={busy}>{busy ? 'Checking your message…' : 'Send demo message'}<ArrowRight
                            size={17}/></button>
                    </form>
                </>}</section>
        </div>
    </div>
}

function Shipping() {
    return <div className="container info-page shipping-page"><InfoHeading label="The finer details"
                                                                           title="Good things, on their way."
                                                                           description="Simple shipping. Thoughtful returns. Here’s how it would work."/>
        <div className="sample-policy-banner"><Star size={17}/><p>Sample demo policy. No orders are shipped and no
            actual returns are processed.</p></div>
        <div className="shipping-cards">
            <article><Truck size={27} strokeWidth={1.3}/><h2>Standard delivery</h2>
                <strong>{money(config.standardShipping)}</strong><p>Free on orders
                    of {money(config.freeShippingThreshold)} or more before discounts.</p><span>Estimated 5–7 business days</span>
            </article>
            <article><PackageCheck size={27} strokeWidth={1.3}/><h2>Express delivery</h2>
                <strong>{money(config.expressShipping)}</strong><p>For when you’d like a little good thing a little
                    sooner.</p><span>Estimated 2–3 business days</span></article>
            <article><Heart size={27} strokeWidth={1.3}/><h2>Easy returns</h2><strong>30 days</strong><p>A little time
                to make sure it’s right for you.</p><span>Unworn, with original tags</span></article>
        </div>
        <div className="policy-content shipping-content">
            <section><h2>A few shipping details</h2><p>Demo checkout supports US addresses and calculates all prices in
                USD. Standard delivery becomes free when the order subtotal before discounts meets
                the {money(config.freeShippingThreshold)} threshold. Express delivery is charged at its flat rate,
                regardless of order value.</p><p>Shipping estimates begin after the illustrative order date and are
                shown again on your confirmation. Business days are Monday through Friday. These timeframes are examples
                only; no fulfillment service is connected.</p></section>
            <section><h2>Returns, with a little care</h2><p>Our sample return policy allows unworn, unwashed items with
                their original tags to be returned within 30 days of delivery. Keep the original packaging where
                possible. For hygiene reasons, any products marked final sale would be excluded.</p><p>In a live store,
                our team would help arrange a return or exchange. For this demo, you can explore product details and
                place simulated orders without creating any real purchase or return obligation.</p></section>
            <section><h2>Discounts & taxes</h2><p>Use STAR10 for 10% off an eligible subtotal
                of {money(config.couponMinimum)} or more. Sale items are included. Shipping eligibility uses the
                merchandise subtotal before discounts. Tax is excluded from this demo, and no payment is collected.</p>
            </section>
            <section><h2>Need a little help?</h2><p>Find more answers in our <Link to="/faq">FAQs</Link>, or try
                our <Link to="/contact">demo contact form</Link>.</p></section>
        </div>
    </div>
}

function Policy({kind}: { kind: 'privacy' | 'terms' }) {
    const privacy = kind === 'privacy';
    return <div className="container info-page policy-page"><InfoHeading label="The small print"
                                                                         title={privacy ? 'Your privacy matters.' : 'A few simple ground rules.'}
                                                                         description={privacy ? 'A clear look at what this demo saves, and why.' : 'Please read these sample terms before exploring the demo.'}/>
        <div className="sample-policy-banner"><Star size={17}/><p>Sample demo copy. This is illustrative policy content,
            not legal advice or a production policy.</p></div>
        <div className="policy-content">{privacy ? <>
            <section><h2>1. About this demo</h2><p>Little Stars is a fictional clothing storefront built to demonstrate
                a shopping experience. It does not connect to a backend, database, real payment provider, or
                authentication service.</p></section>
            <section><h2>2. Information saved in your browser</h2><p>The demo stores your shopping bag, wishlist, demo
                profile, preferences, and simulated order history in localStorage on this device. Order records contain
                the contact and shipping details entered during checkout, together with a snapshot of the purchased
                items and totals.</p><p>Please use fictional information when trying checkout or editing your profile.
                This local storage is not encrypted and is not designed to hold sensitive information. No passwords or
                card details are requested.</p></section>
            <section><h2>3. Forms and messages</h2><p>The newsletter and contact forms validate your entries and show a
                simulated success message. They do not send messages or subscribe you to a mailing list. Contact form
                contents are not persisted.</p></section>
            <section><h2>4. External services</h2><p>This demo does not use analytics, advertising cookies, or paid
                commerce services. Links you choose to open may be governed by the destination’s own policies. The
                sample contact email uses a reserved example domain.</p></section>
            <section><h2>5. Removing your data</h2><p>You can remove all demo data using your browser’s site settings:
                clear this site’s stored data or localStorage, then refresh the page. Signing out hides your demo
                profile; locally stored order history remains available until site data is cleared.</p></section>
            <section><h2>6. Questions</h2><p>Visit the <Link to="/contact">demo contact page</Link> to explore the
                contact form. Messages are simulated and are not delivered.</p></section>
        </> : <>
            <section><h2>1. A demo experience</h2><p>Little Stars is a static ecommerce demonstration. Product listings,
                prices, stock counts, brand information, policies, and delivery estimates are sample content. They do
                not constitute an offer to sell real goods.</p></section>
            <section><h2>2. Simulated purchases</h2><p>All checkout actions are simulated. No payment will be collected,
                no real order will be fulfilled, and no goods will be shipped. Order confirmations and history are saved
                only in your browser for the purpose of exploring the demo.</p></section>
            <section><h2>3. Pricing and availability</h2><p>All amounts are shown in US dollars. Discounts and shipping
                are calculated using the published demo rules. Tax is excluded. Variant availability is sample data and
                is checked when items are added or a demo order is placed.</p></section>
            <section><h2>4. Demo account access</h2><p>The account area offers a sample profile without passwords or
                secure authentication. It is not a real customer account. Use fictional details and do not enter
                sensitive personal information.</p></section>
            <section><h2>5. Acceptable use</h2><p>You may browse the storefront and try its interactions for evaluation.
                Content and photography are included for demonstration. Any future production use would require
                appropriate review of product claims, image rights, accessibility, privacy, and legal terms.</p>
            </section>
            <section><h2>6. Changes and availability</h2><p>This demo may change or be reset at any time. Browser
                storage can be cleared by you or your browser. No guarantee is made that locally saved demo orders,
                profiles, or preferences will remain available.</p></section>
            <section><h2>7. Contact</h2><p>Explore the <Link to="/faq">FAQs</Link> for help, or try the <Link
                to="/contact">simulated contact form</Link>. No messages are sent.</p></section>
        </>}<p className="policy-updated">Sample policy · Last updated October 2026</p></div>
    </div>
}
