"use client";
import { Dialog,DialogTrigger,DialogContent, DialogTitle } from "./ui/dialog";
import { useState } from "react";
import PricingSection from "./PricingSection";

const PricingModal = ({subscriptiontier = "free" , children}) => {

  const [isOpen, setisOpen] = useState(false);

  const canOpen = subscriptiontier === "free";

 return (

<Dialog open={isOpen} onOpenChange={canOpen ? setisOpen : undefined}>
  <DialogTrigger asChild>
  {children}
</DialogTrigger>
  <DialogContent className="p-8 pt-4 sm:max-w-4xl">
      <DialogTitle/>
    <PricingSection/>
  </DialogContent>
</Dialog>
  )
}

export default PricingModal
