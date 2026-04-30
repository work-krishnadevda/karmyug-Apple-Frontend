import PropTypes from 'prop-types'
import React, { useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { CBadge } from '@coreui/react'
import { CNavItem, CNavGroup, CNavTitle } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { useSelector } from 'react-redux'
import { hasAccess } from 'src/constants/common'


export const AppSidebarNav = ({ items }) => {
  const location = useLocation()
  const userData = useSelector((state) => state?.userData)

  let userRole = userData?.role
  // console.log('AppSidebarNav userRole:', userRole); // Debug log - removed for production
  

  const navLink = (name, icon, badge) => (
    <>
      {icon && icon}
      {name && name}
      {badge && (
        <CBadge color={badge.color} className="ms-auto">
          {badge.text}
        </CBadge>
      )}
    </>
  )

  const renderNavItem = (item, index) => {
    const { component, name, badge, icon, ...rest } = item;
    const Component = component;
    // Check for universalAccess flag or use hasAccess function
    const hasUniversalAccess = item.meta?.universalAccess === true;
    return (
      (hasUniversalAccess || hasAccess(userRole, item.meta?.role || [])) && (
        <Component {...(rest.to && !rest.items && { component: NavLink })} key={index} {...rest}>
          {navLink(name, icon, badge)}
        </Component>
      )
    );
  };

  const renderNavGroup = (item, index) => {
    const { component, name, icon, to, className, ...rest } = item
    const Component = component

    // Check if the parent group is active
    const isActive = location.pathname.startsWith(to)

    // Check for universalAccess flag or use hasAccess function
    const hasUniversalAccess = item.meta?.universalAccess === true;

    return (
      (hasUniversalAccess || hasAccess(userRole, item.meta?.role || [])) && (
        <Component
          className={className}
          idx={String(index)}
          key={index}
          toggler={navLink(name, icon)}
          visible={isActive}
          {...rest}
        >
          {item.items?.map((subItem, subIndex) =>
            subItem.items ? renderNavGroup(subItem, subIndex) : renderNavItem(subItem, subIndex),
          )}
        </Component>)
    )
  }


  return (
    <React.Fragment>
      {items &&
        items.map((item, index) =>
          item.items ? renderNavGroup(item, index) : renderNavItem(item, index),
        )}
    </React.Fragment>
  )

}

AppSidebarNav.propTypes = {
  items: PropTypes.arrayOf(PropTypes.any).isRequired,
}

export default AppSidebarNav
