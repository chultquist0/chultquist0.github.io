---
layout: page
title: crosswords
permalink: /crosswords/
description: A Collection of Crosswords
nav: true
nav_order: 3
display_categories: [fun]
horizontal: false
---

I am an avid crossword constructor, especially non-traditional ones. See some of my creations below:

<!-- Display projects without categories -->

{% assign sorted_projects = site.crosswords | sort: "importance" %}

  <!-- Generate cards for each project -->

{% if page.horizontal %}

  <div class="container">
    <div class="row row-cols-1 row-cols-md-2">
    {% for project in sorted_projects %}
      {% include projects_horizontal.liquid %}
    {% endfor %}
    </div>
  </div>
  {% else %}
  <div class="row row-cols-1 row-cols-md-3">
    {% for project in sorted_projects %}
      {% include projects.liquid %}
    {% endfor %}
  </div>
  {% endif %}
{% endif %}
</div>
