import { cilChevronBottom, cilOptions } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { CDropdown, CDropdownMenu, CDropdownToggle } from '@coreui/react'

export default function AppActionDropdown({
  statusLabel,
  statusTone = 'live',
  visible,
  onVisibleChange,
  children,
  ariaLabel = 'Open actions',
  className = '',
  triggerLabel = 'More',
}) {
  const isHold = statusTone === 'hold'

  return (
    <div className={`case-action-dropdown-wrap app-action-dropdown-wrap ${className}`.trim()}>
      <CDropdown
        alignment="end"
        placement="bottom-end"
        className={`case-action-dropdown app-action-dropdown ${visible ? 'show' : ''}`.trim()}
        visible={visible}
        autoClose="outside"
        portal
        onShow={() => onVisibleChange?.(true)}
        onHide={() => onVisibleChange?.(false)}
      >
        <CDropdownToggle
          caret={false}
          className="case-action-trigger app-action-trigger"
          aria-label={ariaLabel}
          onClick={() => onVisibleChange?.(!visible)}
        >
          <span className="case-action-trigger__icon-wrap app-action-trigger__icon-wrap">
            <CIcon icon={cilOptions} className="case-action-trigger__icon app-action-trigger__icon" />
          </span>
          <span className="case-action-trigger__label app-action-trigger__label">{triggerLabel}</span>
          <CIcon icon={cilChevronBottom} className="case-action-trigger__caret app-action-trigger__caret" />
        </CDropdownToggle>

        <CDropdownMenu className="case-action-menu app-action-menu">
          {statusLabel ? (
            <div className="case-action-menu__summary app-action-menu__summary">
              <span
                className={`case-action-menu__state app-action-menu__state ${
                  isHold
                    ? 'case-action-menu__state--hold app-action-menu__state--hold'
                    : 'case-action-menu__state--live app-action-menu__state--live'
                }`}
              >
                {statusLabel}
              </span>
            </div>
          ) : null}
          {children}
        </CDropdownMenu>
      </CDropdown>
    </div>
  )
}
