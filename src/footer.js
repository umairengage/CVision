import React from "react";
import footerrlogo from './assets/logo.png';
const Footer = () => {
return (
<div>
   <footer>
      <div class="container">
         <div class="row">
            <div class="col-md-4">
               <div class="flogo">
                  <img src={footerrlogo} alt=""/>
               </div>
               <p class="desc">Empowering job seekers with AI-powered resume analysis and career insights. Get matched to your dream job with intelligent keyword analysis.</p>
               <div class="row">
                  <div class="col-auto">
                     <button class="btn-custom">GitHub</button>
                  </div>
                  <div class="col-auto">
                     <button class="btn-custom">Contact</button>
                  </div>
               </div>
            </div>
            <div class="col-md-4">
               <div class="footermenu">
                  <h6 class="heading">Features</h6>
                  <ul>
                     <li><a href="#">Keyword matching</a></li>
                     <li><a href="#">Compatibility scoring</a></li>
                     <li><a href="#">AI Insights</a></li>
                     <li><a href="#">Skills analysis</a></li>
                  </ul>
               </div>
            </div>
            <div class="col-md-4">
               <div class="footermenu">
                  <h6 class="heading">Resources</h6>
                  <ul>
                     <li><a href="#">Skills analysis</a></li>
                     <li><a href="#">Resume Templates</a></li>
                     <li><a href="#">Interviewer Tips</a></li>
                     <li><a href="#">Job Boards</a></li>
                  </ul>
               </div>
            </div>
         </div>
         <div class="row text-center mt-5">
            <div class="col-md-3 stat">
               <h5>2,847+</h5>
               <p>Resume Analysis</p>
            </div>
            <div class="col-md-3 stat">
               <h5>94%</h5>
               <p>Success Rate</p>
            </div>
            <div class="col-md-3 stat">
               <h5>4.9/5</h5>
               <p>User Rating</p>
            </div>
            <div class="col-md-3 stat">
               <h5>30%</h5>
               <p>Avg Analysis</p>
            </div>
         </div>
      </div>
   </footer>
</div>
);
};
export default Footer;