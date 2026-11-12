---
title: "CROssBARv2 Is Live: A Biomedical Knowledge Graph You Can Question in Plain English"
author: research-news
tags:
  - knowledge graphs
  - large language models
  - CROssBARv2
image: /images/news/crossbarv2-launch.jpg
image_alt: "Meet CROssBARv2, a unified biomedical knowledge graph"
---

CROssBARv2 is now available as an online platform, and its preprint is out.

Biomedical knowledge is scattered across many databases: genes in one, drugs in another, diseases somewhere else. Connecting them usually takes serious programming. CROssBARv2 integrates 34 established resources into a single knowledge graph with about 2.7 million nodes (proteins, genes, drugs, diseases, pathways, side effects and more), about 12.6 million edges, 14 node types and 51 edge types, all enriched with provenance, evidence and confidence metadata.

### CROssBAR-LLM

Large language models are fluent but can hallucinate, which is risky in biomedicine. CROssBAR-LLM grounds the model in the knowledge graph: a question in plain English is translated into a database query, run on CROssBARv2 in real time, and the retrieved results are turned into a readable answer that can be traced back to the data. On a biomedical question-answering benchmark, CROssBAR-LLM reached 98% accuracy with Gemini 1.5 Pro and 97% with GPT-4o, compared with roughly 50–65% for the same kind of models answering directly.

The graph can also be explored through the Neo4j Browser and a GraphQL API, with vector search over ESM2 and SELFormer embeddings. All data and code are openly available.

The work is a collaboration with the Saez-Rodriguez lab, spanning Hacettepe University, Heidelberg University, Helmholtz Munich and EMBL-EBI. Team: Bünyamin Şen, Erva Ulusoy, Melih Darcan, Mert Ergün, Sebastian Lobentanzer, Ahmet Süreyya Rifaioğlu, Dénes Türei, Julio Saez-Rodriguez and Tunca Doğan.

**Links**

* Preprint: [bioRxiv](https://www.biorxiv.org/content/10.64898/2026.04.12.718028v1)
* Web platform: [crossbarv2.hubiodatalab.com](https://crossbarv2.hubiodatalab.com/)
* CROssBAR-LLM: [crossbarv2.hubiodatalab.com/llm](https://crossbarv2.hubiodatalab.com/llm)
* Tutorial video: [YouTube](https://youtu.be/FjuoKAmzjNM)
