//App SideBar

import React from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { CImage, CSidebar, CSidebarBrand, CSidebarNav, CSidebarToggler } from '@coreui/react'

import { AppSidebarNav } from './AppSidebarNav'

import SimpleBar from 'simplebar-react'
import 'simplebar/dist/simplebar.min.css'
import navigation from '../_nav'

const AppSidebar = ({ navItems }) => {
  const dispatch = useDispatch()
  const unfoldable = useSelector((state) => state.sidebarUnfoldable)
  const sidebarShow = useSelector((state) => state.sidebarShow)

  return (
    <CSidebar
      position="fixed"
      unfoldable={unfoldable}
      visible={sidebarShow}
      onVisibleChange={(visible) => {
        dispatch({ type: 'set', sidebarShow: visible })
      }}
      className="app-sidebar"
    >
      <CSidebarBrand className="d-none app-sidebar d-md-flex justify-content-start px-4" to="/">
        {/* <CIcon className="sidebar-brand-full" icon={logoNegative} height={35} /> */}
        {/* <CIcon className="sidebar-brand-narrow" icon={sygnet} height={35} /> */}
        <h4 className="mb-0 flex gap-2">
          <CImage
            src="/sidebarLogo.png"
            width={68}
            height={50}
            style={{ paddingRight: '2px' }}
          ></CImage>

          {/* <CImage src="/logo.png" alt="Logo" /> */}
          <span
            className="yellow pl-2 text-white"
            style={{
              position: 'relative',
              top: '8px',
            }}
          >
            ValuXpert
          </span>
        </h4>
      </CSidebarBrand>
      <CSidebarNav className="sidebar-links">
        <SimpleBar>
          <AppSidebarNav items={navItems || navigation} />
        </SimpleBar>
      </CSidebarNav>
      <CSidebarToggler
        className="d-none app-sidebar d-lg-flex"
        onClick={() => dispatch({ type: 'set', sidebarUnfoldable: !unfoldable })}
      />
    </CSidebar>
  )
}

export default React.memo(AppSidebar)
