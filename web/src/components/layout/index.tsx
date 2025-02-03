import React from 'react'
import { Outlet } from "react-router-dom"
import {Header} from "../header"
import { Container } from "../container"
import { NavBar } from "../nav-bar"

export const Layout = () => {
  return (
    <>
        <Header />
        <Container>
            <div className="flex-2 p-4">
                <NavBar />
            </div>
            <div className='flex-1 p-4'>
                <Outlet />
            </div>
            
        </Container>
    </>
  )
}
