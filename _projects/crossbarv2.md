---
title: "CROssBARv2"
image: images/projects/crossbarv2.jpg
highlight: true

project-number: "120E531"
project-title: "Integrative Representation and Deep Graph Learning Based Prediction of Complex and Heterogeneous Relationships in Biomolecular and Biomedical Data"
project-role: pi-lab
project-partners: ["Saezlab", "Heidelberg University"]
---

# CROssBARv2

Systematic analysis of large-scale biomedical data is critical for deciphering mechanisms and enabling personalized, clinically actionable therapies. Two impediments limit translation: (i) many relationships among biological entities (e.g., protein–function, gene–disease) remain unknown, and (ii) heterogeneous technologies, data models, and storage formats prevent a unified, integrable resource. Addressing these gaps requires new methods that both integrate disparate datasets and learn missing relations. We developed an end-to-end computational system that integrates heterogeneous biological/biomedical data from multiple open sources into graph-structured knowledge graphs, and applies deep graph neural networks to predict complex inter-entity relations. In Stage 1, we implemented automated pipelines to ingest and fuse multi-layer biological data and persist them in a graph database. In Stage 2, we formulated relation inference as link prediction over the resulting heterogeneous graphs and trained deep models directly on biological graphs. As two concrete applications, we trained models to (i) predict protein–function assignments and (ii) predict drug–target protein interactions. Selected predictions were corroborated by targeted literature checks. We deployed the integrated graphs and models as an online network service for open scientific use and reproducibility, and coupled the system with large language models to power a domain chatbot that answers natural-language scientific queries with minimized hallucination risk ([https://crossbarv2.hubiodatalab.com/](https://crossbarv2.hubiodatalab.com/)). We anticipate broad impact in hypothesis generation and testing across the life sciences, by enabling researchers to interrogate complex, system-level relationships among genes/proteins and their functions, variants, and expression profiles, and their connections to diseases, phenotypes, drugs, and underlying biological mechanisms.
