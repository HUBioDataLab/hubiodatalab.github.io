---
title: "MoCL-GAT Published in BMC Bioinformatics"
author: research-news
tags:
  - drug discovery
  - representation learning
  - graph neural networks
image: /images/news/mocl-gat.jpg
image_alt: "MoCL-GAT architecture: local contrastive learning and global descriptor regression on a graph attention encoder"
---

Our paper "MoCL-GAT: Molecular Contrastive Learning with Graph Attention Network for Enhanced Molecular Representation" is out in *BMC Bioinformatics*.

Labelled bioactivity data is scarce and expensive, which limits how far supervised models generalise across chemical space. Self-supervised learning helps by first learning molecular representations from unlabelled data, but most methods capture either local structure or global molecular properties, rarely both. MoCL-GAT combines the two with a graph attention network trained on two objectives:

* a local contrastive objective on augmented K-hop subgraph views, capturing atomic environments, functional groups and pharmacophoric patterns;
* a global objective that predicts 78 curated RDKit physicochemical descriptors.

Pre-trained on 1.9 million ChEMBL compounds and fine-tuned on MoleculeNet benchmarks, MoCL-GAT performs strongly on blood–brain barrier penetration, side-effect prediction, solubility and hydration free energy. Ablations show that neither objective alone matches the combined approach. Pre-training takes about 16 hours on a single RTX 3090.

Authors: Alperen Dalkıran, Ahmet Süreyya Rifaioğlu, Rengül Çetin-Atalay, Aybar C. Acar, Tunca Doğan and M. Volkan Atalay. Congratulations to first author Alperen Dalkıran!

**Links**

* Paper (open access): [BMC Bioinformatics](https://link.springer.com/article/10.1186/s12859-026-06409-z)
* Code, weights and data: [Zenodo](https://doi.org/10.5281/zenodo.16927285)
