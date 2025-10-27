---
title: Contact
nav:
  order: 5
  tooltip: Email, address, and location
---

# {% include icon.html icon="fa-regular fa-envelope" %}Contact

Hacettepe Biological Data Science Lab, Department of Computer Engineering, Hacettepe University, 06800, Ankara, Türkiye

{%
  include button.html
  type="email"
  text="hubiodatascilab@gmail.com"
  link="mailto:hubiodatascilab@gmail.com"
%} 
{%
  include button.html
  type="email"
  text="tuncadogan@gmail.com"
  link="mailto:tuncadogan@gmail.com"
%}
{%
  include button.html
  type="email"
  text="tuncadogan@hacettepe.edu.tr"
  link="mailto:tuncadogan@hacettepe.edu.tr"
%}


{% include section.html %} 

<h2 style="text-align:center; margin-top:2rem;">
  📍 Location
</h2>


<!-- Google Maps -->

<div style="display: flex; justify-content: center; align-items: center; margin: 2rem 0;">
  <iframe
    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3062.1251644685512!2d32.733790775565545!3d39.87143418864808!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14d3476c7df6a739%3A0xd3ae6a4e60ccb982!2sHacettepe%20%C3%9Cniversitesi%20Bilgisayar%20M%C3%BChendisli%C4%9Fi!5e0!3m2!1str!2str!4v1760029587236!5m2!1str!2str"
    width="500"
    height="500"
    style="border:0; border-radius: 12px; box-shadow: 0 0 15px rgba(0,0,0,0.2); max-width: 90vw; height: auto; aspect-ratio: 1/1;"
    allowfullscreen=""
    loading="lazy"
    referrerpolicy="no-referrer-when-downgrade">
  </iframe>
</div>





<!-- Address-->
<div style="margin-top: 1rem; text-align: center;">
  📍 <strong>Hacettepe University Biological Data Science Laboratory</strong><br>
  Department of Computer Engineering, Beytepe Campus,<br>
  06800 Ankara, Türkiye
</div> 

{%
  include button.html
  type="address"
  tooltip="Our location on Google Maps for easy navigation"
  link="https://maps.app.goo.gl/gdG4ZcpuSvUXQoCc7"
%}


{% include section.html %}

{% include section.html dark=true %}

{% capture col1 %}
<div style="text-align: center; color: #ccc; font-size: 0.95rem; line-height: 1.6;">
  <strong>Hacettepe University</strong><br>
  <a href="https://www.hacettepe.edu.tr/" target="_blank"
     style="color: #ccc; text-decoration: none;"
     onmouseover="this.style.color='#fff'"
     onmouseout="this.style.color='#ccc'">
    https://www.hacettepe.edu.tr/
  </a>
</div>
{% endcapture %}

{% capture col2 %}
<div style="text-align: center; color: #ccc; font-size: 0.95rem; line-height: 1.6;">
  <strong>Hacettepe University Computer Engineering – Artificial Intelligence Engineering</strong><br>
  <a href="https://www.cs.hacettepe.edu.tr/" target="_blank"
     style="color: #ccc; text-decoration: none;"
     onmouseover="this.style.color='#fff'"
     onmouseout="this.style.color='#ccc'">
    https://www.cs.hacettepe.edu.tr/
  </a>
</div>
{% endcapture %}

{% capture col3 %}
<div style="text-align: center; color: #ccc; font-size: 0.95rem; line-height: 1.6;">
  <strong>Hacettepe University Bioinformatics Department</strong><br>
  <a href="https://biyoinformatik.hacettepe.edu.tr/" target="_blank"
     style="color: #ccc; text-decoration: none;"
     onmouseover="this.style.color='#fff'"
     onmouseout="this.style.color='#ccc'">
    https://biyoinformatik.hacettepe.edu.tr/
  </a>
</div>
{% endcapture %}

{% include cols.html col1=col1 col2=col2 col3=col3 %}
