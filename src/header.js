import React from "react";
import headerlogo from './assets/logo.png';
const Header = () => {
return (
<div>
   <header>
      <div class="container">
         <div class="row">
            <div class="col-md-3">
               <div class="hlogo">
                  <img src={headerlogo} alt="Logo"/>
               </div>
            </div>
            <div class="col-md-6">
               <div class="navigation">
                  <ul>
                     <li><a href="#">Features</a></li>
                     <li><a href="#">How It Works</a></li>
                     <li><a href="#">Pricing</a></li>
                  </ul>
               </div>
            </div>
         </div>
      </div>
   </header>
</div>
);
};
export default Header;