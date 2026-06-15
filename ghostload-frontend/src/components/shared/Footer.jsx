import { Link } from 'react-router-dom';
import { Zap, Mail, Globe, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ background: 'var(--surface-dark-2)', color: 'var(--text-inverse)', padding: '4rem 0 2rem' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem', marginBottom: '3rem' }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
              <div style={{ width: 32, height: 32, background: 'var(--accent-terracotta)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={16} color="#fff" fill="#fff" />
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem' }}>GhostLoad</span>
            </div>
            <p style={{ color: 'var(--text-inverse-muted)', fontSize: '0.875rem', lineHeight: 1.7, maxWidth: 240 }}>
              Expose what your office wastes after dark. Fast, transparent, and built for operators.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
              {[Globe, MessageCircle, Mail].map((Icon, i) => (
                <a key={i} href="#" style={{ width: 36, height: 36, background: 'rgba(245,240,230,0.08)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-inverse-muted)', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(215,106,74,0.2)'; e.currentTarget.style.color = 'var(--accent-terracotta-light)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(245,240,230,0.08)'; e.currentTarget.style.color = 'var(--text-inverse-muted)'; }}>
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <div className="text-label" style={{ color: 'var(--text-inverse-muted)', marginBottom: '1rem' }}>Product</div>
            {[['Features', '/features'], ['About', '/about'], ['Pricing', '/pricing'], ['Contact', '/contact']].map(([label, href]) => (
              <Link key={href} to={href} style={{ display: 'block', color: 'var(--text-inverse-muted)', fontSize: '0.875rem', marginBottom: '0.6rem', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = 'var(--text-inverse)'}
                onMouseLeave={e => e.target.style.color = 'var(--text-inverse-muted)'}>
                {label}
              </Link>
            ))}
          </div>

          {/* Legal */}
          <div>
            <div className="text-label" style={{ color: 'var(--text-inverse-muted)', marginBottom: '1rem' }}>Legal</div>
            {[['Privacy Policy', '#'], ['Terms of Service', '#'], ['Cookie Policy', '#']].map(([label, href]) => (
              <a key={label} href={href} style={{ display: 'block', color: 'var(--text-inverse-muted)', fontSize: '0.875rem', marginBottom: '0.6rem', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = 'var(--text-inverse)'}
                onMouseLeave={e => e.target.style.color = 'var(--text-inverse-muted)'}>
                {label}
              </a>
            ))}
          </div>

          {/* Newsletter CTA */}
          <div>
            <div className="text-label" style={{ color: 'var(--text-inverse-muted)', marginBottom: '1rem' }}>Stay Updated</div>
            <p style={{ color: 'var(--text-inverse-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>Energy-saving tips and product updates.</p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input type="email" placeholder="your@email.com" className="form-input" style={{ flex: 1, background: 'rgba(245,240,230,0.08)', border: '1px solid rgba(245,240,230,0.12)', color: 'var(--text-inverse)', fontSize: '0.875rem', padding: '0.6rem 0.875rem' }} />
              <button className="btn btn-primary btn-sm" style={{ flexShrink: 0 }}>→</button>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(245,240,230,0.08)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <span style={{ color: 'var(--text-inverse-muted)', fontSize: '0.8rem' }}>
            © 2026 GhostLoad. Estimated insights, real savings.
          </span>
          <span style={{ color: 'var(--text-inverse-muted)', fontSize: '0.8rem' }}>
            All estimates are heuristic models, not audit-grade metering.
          </span>
        </div>
      </div>
    </footer>
  );
}
