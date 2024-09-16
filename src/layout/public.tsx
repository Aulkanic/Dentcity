import React from 'react'
import { Outlet } from 'react-router-dom'

export default function Public() {
  return (
  <div>
  <Outlet />
  <div className="fixed right-4 bottom-4 w-80 h-64">
</div>
</div>
)
}
