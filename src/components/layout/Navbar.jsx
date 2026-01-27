import React from 'react';
import { Menu } from 'lucide-react';
import './Navbar.css'; 

const Navbar = (props) => {
  return (
    <header className="mobile-header">
       <div className="flex-row gap-sm" style={{display:'flex', alignItems:'center'}}>
         <button 
           onClick={props.onOpenDrawer} 
           style={{border:'none', background:'none', cursor:'pointer', padding:'8px'}}
         >
           <Menu />
         </button>
         
         <span style={{fontWeight:'bold', fontSize:'1.2rem', marginLeft:'8px'}}>
           PetroPulse
         </span>
       </div>
    </header>
  );
};

export default Navbar;