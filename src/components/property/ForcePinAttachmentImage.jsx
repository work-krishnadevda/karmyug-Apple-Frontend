import React, { useCallback, useEffect, useMemo, useState } from 'react'
import BasicProvider from 'src/constants/BasicProvider'

/**
 * Fetch signed URLs for all keys in one round-trip (smoother than N separate child fetches).
 */
function usePinAttachmentUrls(keys) {
  const [urlsByKey, setUrlsByKey] = useState({})
  const [loading, setLoading] = useState(false)

  const keysSig = useMemo(() => keys.join('\0'), [keys])

  useEffect(() => {
    if (!keys.length) {
      setUrlsByKey({})
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    setUrlsByKey({})

    ;(async () => {
      try {
        const results = await Promise.all(
          keys.map(async (key) => {
            try {
              const res = await new BasicProvider(
                `cms/files/signed-url?key=${encodeURIComponent(key)}`,
              ).getRequest()
              return { key, url: res?.data?.url || null }
            } catch {
              return { key, url: null }
            }
          }),
        )
        if (cancelled) return
        const next = {}
        results.forEach(({ key, url }) => {
          if (url) next[key] = url
        })
        setUrlsByKey(next)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [keysSig])

  return { urlsByKey, loading }
}

const heroHeight = 168
const thumbSize = 52

function PinPhotosProGallery({ keys }) {
  const { urlsByKey, loading } = usePinAttachmentUrls(keys)
  const [active, setActive] = useState(0)

  const resolvedKeys = useMemo(
    () => keys.filter((k) => urlsByKey[k]),
    [keys, urlsByKey],
  )

  useEffect(() => {
    if (active >= resolvedKeys.length) setActive(Math.max(0, resolvedKeys.length - 1))
  }, [active, resolvedKeys.length])

  const go = useCallback(
    (dir) => {
      if (resolvedKeys.length <= 1) return
      setActive((i) => (i + dir + resolvedKeys.length) % resolvedKeys.length)
    },
    [resolvedKeys.length],
  )

  if (!keys.length) return null

  const currentKey = resolvedKeys[active]
  const currentUrl = currentKey ? urlsByKey[currentKey] : null

  return (
    <div
      className="force-pin-map-gallery"
      style={{
        marginBottom: 14,
        marginTop: 4,
        maxWidth: 300,
        fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div
        className="d-flex align-items-center justify-content-between mb-2"
        style={{ paddingRight: 2 }}
      >
        <span
          className="d-inline-flex align-items-center gap-1 text-uppercase"
          style={{
            fontSize: 10,
            letterSpacing: '0.06em',
            fontWeight: 700,
            color: '#64748b',
          }}
        >
          <span
            aria-hidden
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
            }}
          />
          Photos
        </span>
        {!loading && resolvedKeys.length > 0 && (
          <span
            className="badge rounded-pill"
            style={{
              background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
              color: '#475569',
              fontWeight: 600,
              fontSize: 11,
              padding: '4px 10px',
            }}
          >
            {resolvedKeys.length}
          </span>
        )}
      </div>

      <div
        style={{
          position: 'relative',
          borderRadius: 14,
          overflow: 'hidden',
          background: 'linear-gradient(160deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(148, 163, 184, 0.25)',
        }}
      >
        <div
          style={{
            height: heroHeight,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0f172a',
          }}
        >
          {loading && (
            <div className="text-white-50 small d-flex flex-column align-items-center gap-2 py-4">
              <div
                className="spinner-border spinner-border-sm text-light"
                role="status"
                style={{ opacity: 0.85 }}
              />
              Loading photos…
            </div>
          )}
          {!loading && currentUrl && (
            <a href={currentUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'block', width: '100%', height: '100%' }}>
              <img
                src={currentUrl}
                alt={`Attachment ${active + 1}`}
                style={{
                  width: '100%',
                  height: heroHeight,
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </a>
          )}
          {!loading && resolvedKeys.length === 0 && (
            <span className="text-white-50 small px-3 text-center">Could not load images</span>
          )}
        </div>

        {resolvedKeys.length > 1 && currentUrl && (
          <>
            <button
              type="button"
              aria-label="Previous photo"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                go(-1)
              }}
              style={{
                position: 'absolute',
                left: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 34,
                height: 34,
                borderRadius: '50%',
                border: 'none',
                background: 'rgba(255,255,255,0.92)',
                boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                cursor: 'pointer',
                fontSize: 18,
                lineHeight: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#334155',
              }}
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Next photo"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                go(1)
              }}
              style={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 34,
                height: 34,
                borderRadius: '50%',
                border: 'none',
                background: 'rgba(255,255,255,0.92)',
                boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                cursor: 'pointer',
                fontSize: 18,
                lineHeight: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#334155',
              }}
            >
              ›
            </button>
            <div
              style={{
                position: 'absolute',
                bottom: 8,
                right: 10,
                fontSize: 11,
                fontWeight: 600,
                color: '#fff',
                textShadow: '0 1px 3px rgba(0,0,0,0.8)',
              }}
            >
              {active + 1} / {resolvedKeys.length}
            </div>
          </>
        )}
      </div>

      {resolvedKeys.length > 1 && (
        <div
          className="d-flex gap-1 mt-2 pb-1"
          style={{
            overflowX: 'auto',
            scrollbarWidth: 'thin',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {resolvedKeys.map((k, i) => (
            <button
              key={`${k}-${i}`}
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setActive(i)
              }}
              style={{
                flex: '0 0 auto',
                width: thumbSize,
                height: thumbSize,
                padding: 0,
                border:
                  i === active
                    ? '2px solid #6366f1'
                    : '2px solid transparent',
                borderRadius: 10,
                overflow: 'hidden',
                cursor: 'pointer',
                boxShadow: i === active ? '0 2px 8px rgba(99,102,241,0.45)' : '0 1px 4px rgba(0,0,0,0.08)',
                opacity: i === active ? 1 : 0.75,
                transition: 'opacity 0.15s, box-shadow 0.15s, border-color 0.15s',
              }}
            >
              <img
                src={urlsByKey[k]}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </button>
          ))}
        </div>
      )}

      {!loading && currentUrl && (
        <div className="text-center mt-1">
          <a
            href={currentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="small"
            style={{ color: '#4f46e5', fontWeight: 600, textDecoration: 'none' }}
            onClick={(e) => e.stopPropagation()}
          >
            Open full size ↗
          </a>
        </div>
      )}
    </div>
  )
}

/**
 * Map InfoWindow: photos first (pro gallery), supports attachmentKeys[] or legacy attachmentKey.
 */
const ForcePinAttachmentsGallery = ({ attachmentKey, attachmentKeys }) => {
  const keys = useMemo(() => {
    if (Array.isArray(attachmentKeys) && attachmentKeys.length > 0) {
      return [...new Set(attachmentKeys.filter((k) => typeof k === 'string' && k.trim()))]
    }
    if (typeof attachmentKey === 'string' && attachmentKey.trim()) {
      return [attachmentKey]
    }
    return []
  }, [attachmentKey, attachmentKeys])

  if (keys.length === 0) return null

  return <PinPhotosProGallery keys={keys} />
}

export default ForcePinAttachmentsGallery
