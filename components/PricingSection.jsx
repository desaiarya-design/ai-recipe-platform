import React from 'react'
import { PricingTable } from "@clerk/nextjs";

const PricingSection = () => {
  return (
    <div>
        <div className="mb-16">
            <h2 className="text-5xl md:text-6xl font-bold mb-4">Simple Pricing</h2>
            <p>Start for free. Upgrade to become a master chef</p>
        </div>

    <div>
        <PricingTable
           checkoutProps={{
            appearance:{
              elements:{
                drawerRoot: {
                  zIndex: 2000,
                },
              },
            },
           }}/>  
        </div>
    </div>
  )
}

export default PricingSection