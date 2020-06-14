---
layout: page
title: Projects
---

{% for project in site.data.projects %}
<section class="project" markdown="1">

## [{{ project.title }}]({{ project.homepage }})
![{{ project.title }} image]({{ site.baseurl }}/images/{{ project.image }})

{{ project.description }}

</section>
{% endfor %}
