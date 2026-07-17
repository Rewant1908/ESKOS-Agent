import json
import os
from pathlib import Path
import re

raw_data = [
  {
    "url": "https://goelscientific.com/product/coil-condenser/",
    "title": "Coil Condenser",
    "tabs": {
      "Key Features": "High heat transfer efficiency\nMultiple parallel coil design for increased surface area.\nManufactured with precision bore tubes of various diameters\nVertical mounting for optimized condensate flow\nSuitable for cooling water and brine (closed circuit)\nMaximum coolant pressure: 2.7 bar (g)\nCorrosion-resistant glass construction\nLow maintenance and easy integration with reactors & distillation columns\nDesigned to prevent coil logging and back pressure issues",
      "Specifications": "Construction Shell: Borosilicate Glass\nConstruction Coils: Parallel glass coil battery\nConstruction Mounting Position: Vertical only\nSteam is not recommended for condenser coils\nAdequate flow of coolant should be used\nCoolant should not be heated to the boiling point.\nFlexible hose connection recommended\n\nMethods of Operation:\n\nVapours from Bottom\nEasy installation over reactors\nCondensate returns near condensing temperature\nRisk of coil logging if condensate flow is excessive\nReflux divider recommended below the condenser\n\nVapours from Top\nProvides cooler condensate\nUtilizes full cooling surface area\nRecommended where logging risk is higher",
      "Applications": "Coil Condensers are widely used in:\nChemical Processing Plants\nPharmaceutical Manufacturing Units\nDistillation Columns\nReflux Systems\nSolvent Recovery Units\nEvaporation Systems\nR&D Pilot Plants\nSpeciality Chemical Production\nFertilizer & Pigment Industries"
    }
  },
  {
    "url": "https://goelscientific.com/product/glass-flask/",
    "title": "Glass Flask",
    "overview": "The Glass Flask product line offers a variety of laboratory flasks made from high-quality borosilicate glass. These flasks are designed for chemical reactions, mixing, heating, distillation, and storage tasks under diverse lab conditions. Typical designs include round-bottom, flat-bottom, volumetric, Erlenmeyer, and multi-neck variants, all integrating standard ground-glass joints for modular connectivity. Goel Scientific ensures compliance with international glass standards (such as DIN ISO 3585 and ASTM E438) and offers customization (neck sizes, neck count, dimensions) to accommodate specific laboratory requirements.",
    "tabs": {
      "Key Features": "Borosilicate glass construction\nVarious shapes available\nChemical resistant\nPrecision manufactured",
      "Specifications": "• Material: Borosilicate glass 3.3 (chemical resistance, thermal stability)\n• Volume range: 50 mL up to ~20 L (depending on flask type)\n• Neck types: 1-, 2-, 3-, or multi-neck configurations with standard taper joints (e.g., 24/29, 29/32, 34/35)\n• Joint quality: precision-ground surfaces for gas-tight sealing\n• Wall thickness: designed to accommodate moderate heating and cooling cycles\n• Temperature range: approximately –50 °C to +200 °C (typical for borosilicate)\n• Optional customizations: extra ports, angled sidearms, widened necks, thicker walls for durability",
      "Applications": "• Reactions (heating, reflux, distillation) in academic and R&D labs\n• Solvent boiling, condensation loops, and intermediate reaction steps\n• Mixing and blending of reagents under controlled conditions\n• Storage of solutions under inert or ambient atmospheres\n• Generation of gas sprayers or liquid dispensers when paired with adapters\nBecause flasks are versatile, they serve as foundational components in chemical synthesis, analytics, educational labs, and pilot setups."
    }
  },
  {
    "url": "https://goelscientific.com/product/glass-beaker/",
    "title": "Glass Beaker",
    "overview": "The Glass Beaker range comprises standard laboratory beakers made from borosilicate glass, widely used for mixing, heating, measuring, and dispensing liquid volumes. Beakers come in various sizes (e.g. 10 mL, 25 mL, 100 mL, up to several liters) with graduated marking, spouts for pouring, and thickened rims for durability. They are resistant to common laboratory chemicals and can be heated, stirred, or used as reaction or holding vessels within normal lab operating conditions.",
    "tabs": {
      "Key Features": "Borosilicate glass construction\nGraduated markings\nSpout for easy pouring\nVarious sizes available",
      "Specifications": "• Material: Borosilicate glass 3.3 (resistant to thermal shock and chemical attack)\n• Volume range: 5 mL to 5 L or greater\n• Wall design: straight sides with a spout for pouring\n• Markings: approximate graduation lines (not for precise measurement)\n• Temperature range: approx. –50 °C to +200 °C\n• Pouring spout: molded lip to minimize spillage\n• Thickness: walls and base designed for durability under normal lab use\n• Optional features: handles, heavy-duty versions, reinforced beakers for frequent heating",
      "Applications": "• General mixing and stirring of liquids\n• Heating, cooling, or boiling solutions\n• Temporary storage or intermediate handling of reagents\n• Solution preparation, dilution, or sample transfer\n• Reaction vessel for small-scale experiments or titrations\nTheir simplicity, ease of cleaning, and wide compatibility make beakers among the most ubiquitous tools in chemical, biological, and analytical labs."
    }
  },
  {
    "url": "https://goelscientific.com/product/desiccators/",
    "title": "Desiccators",
    "overview": "The Desiccators range provides laboratory vacuum and ambient desiccators made from borosilicate glass, used in moisture-sensitive storage or drying of samples. Available in standard and vacuum-capable models, they include ground glass flange covers and PTFE spindles or stopcocks for vacuum sealing. Capacities and diameters are tailored to typical lab needs. Standard models have a ground flange cover with knob top, while vacuum models include a PTFE spindle or stopcock to allow connection to vacuum lines while maintaining integrity. The design enables storage of moisture-sensitive materials, sample drying, or protection from ambient humidity.",
    "tabs": {
      "Key Features": "Borosilicate glass construction\nVacuum compatible\nMoisture protection\nVarious sizes available",
      "Specifications": "• Standard models: ground flange covers with knob top\n• Vacuum models: ground flange with PTFE spindle/stopcock\n• Sizes (approx.): 100 mm, 150 mm, 200 mm, 250 mm, 300 mm inner diameters\n• Flange design: standard ground glass flanges to seal cover\n• Materials: borosilicate glass, PTFE spindle or stopcock\n• Capacity: varying based on diameter and height\n• Vacuum rating: suitable for typical lab vacuum levels (e.g. down to tens of mbar)\n• Seal surfaces: precision-ground for leak minimization\n• Optional: interchangeable joints, spare parts (flange, spindles)",
      "Applications": "• Drying or storage of samples, chemicals, and hygroscopic materials\n• Protection of moisture-sensitive reagents and compounds\n• Vacuum desiccation of catalysts, powders, or electronics\n• Laboratory and analytical settings where controlled humidity is critical\n• Pre- and post-treatment of samples for gravimetric or analytical protocols\nUsing desiccators helps maintain sample integrity, reduce moisture ingress, and enable controlled drying operations."
    }
  },
  {
    "url": "https://goelscientific.com/product/extractors/",
    "title": "Extractors",
    "overview": "The Extractors product line comprises laboratory-grade glass extraction apparatus typically used for solid–liquid or solvent-based extraction. The components include extraction flasks, Soxhlet-like designs, solvent loops, and condensers as required. These extractors are built with borosilicate glass for chemical inertness and durability. They support configurable setups for continuous or batch extraction, with compatibility for various solvents, temperatures, and pressures (within standard glass limits). The modular constructions allow users to assemble, disassemble, or adapt setups per extraction protocol.",
    "tabs": {
      "Key Features": "Borosilicate glass construction\nEfficient extraction\nVarious designs available\nChemical resistant",
      "Specifications": "• Material: borosilicate glass 3.3\n• Compatible components: extraction flask, condenser, solvent loop, sample chamber\n• Operating temperature: up to ~150–200 °C (depending on solvent)\n• Operating pressure: atmospheric or mild vacuum\n• Volume: lab scale, typically 0.1 L to 10 L or more depending on design\n• Connection interfaces: standard glass joints (e.g. 24/40, 29/32)\n• Solvent compatibility: supports common organic and aqueous solvents\n• Modular design: interchangeable parts, easy cleaning/disassembly",
      "Applications": "• Solid–liquid extraction of botanicals, soils, or biomass\n• Solvent extraction of compound from solids or semi-solids\n• Analytical extraction for chromatography or spectroscopic analysis\n• Pilot-scale extraction studies in chemical and pharmaceutical R&D\n• Method development where multiple cycles or reuse of solvent is needed\nThese extractors enable reproducible extraction operations and simplify scale-down or scale-up studies."
    }
  },
  {
    "url": "https://goelscientific.com/product/bell-jar/",
    "title": "Bell Jar",
    "overview": "The Bell Jar is a transparent glass dome, usually open at the bottom, used in laboratory settings to enclose objects under vacuum or controlled atmosphere. Made from borosilicate glass, it typically sits over a base or platform and can interface with vacuum connections for low-pressure experiments. Bell jars vary in diameter and height, with ground flanges to ensure a seal with a base plate. They offer simple containment for vacuum demonstrations, atmospheric isolation, or protective covers for sensitive instrumentation.",
    "tabs": {
      "Key Features": "Borosilicate glass construction\nVacuum compatible\nClear visibility\nVarious sizes available",
      "Specifications": "• Material: Borosilicate glass for strength and clarity\n• Diameter and height: wide range (e.g. 100 mm to 500 mm diameters or more)\n• Flange: ground glass base flange for sealing to base plates\n• Operating pressure: suitable for modest vacuum, not for high vacuum or high positive pressure\n• Temperature tolerance: ambient to ~120–150 °C (depending on design)\n• Seal method: ground flange with grease or O-ring for vacuum sealing\n• Custom options: side ports, viewing windows, thicker walls to reduce stress\n• Use limit: best for low stress vacuum situations; not designed for deep vacuum or high mechanical stress",
      "Applications": "• Vacuum experiments and demonstrations (e.g. sound propagation, pressure effects)\n• Enclosure of sensitive specimens or instruments under inert or controlled gas atmospheres\n• Protective dome over samples, sensors, or apparatus to isolate from environment\n• Display or museum jar use (non-vacuum) for inert atmosphere or dust protection\n• Partial vacuum chamber tasks in teaching labs and low-vac operations"
    }
  },
  {
    "url": "https://goelscientific.com/product/aspirator-bottles/",
    "title": "Aspirator Bottles",
    "overview": "The Bottles product line offers laboratory-grade borosilicate glass bottles suited for reagent, media, and solution storage. Capacities range up to 20 L, with options including standard reagent or solution bottles and variants with aspirator outlets or stoppers. The bottles are fabricated for chemical compatibility, pressure stability (within typical lab ranges), and clarity for content visibility. Reagent bottles, media bottles, and solution bottles are offered in multiple sizes and neck diameters to suit varying lab needs. Custom fabrication for large sizes or specialized designs is possible. The range supports applications in chemical, biological, and analytical laboratories where durable, clean, inert storage is required.",
    "tabs": {
      "Key Features": "Borosilicate glass construction\nVacuum compatible\nVarious sizes available\nChemical resistant",
      "Specifications": "• Maximum capacity: up to 20 L\n• Material: borosilicate glass 3.3 (chemical-resistant, thermally stable)\n• Variants: standard reagent bottle, media / solution bottle, aspirator bottle with outlet, stopper-equipped bottles\n• Dimensions: multiple outer diameters (O.D.) and heights depending on size\n• Neck inner diameters: matching standard stopper sizes\n• Outlet I.D.: for aspirator and stopcock variants\n• Compatibility: vacuum or mild pressure (within material limits)\n• Fabrication tolerance: precision glass forming to maintain sealability and interchangeability\n• Optional: customization for specific neck sizes, ports, or accessories",
      "Applications": "• Storage and handling of reagents, solvents, and media\n• Use in analytical labs, synthesis labs, and pilot labs\n• Handling aspirated liquids or vacuum-driven processes (aspirator bottles)\n• Use as intermediate collection vessels or feed reservoirs\n• Safe chemical containment for corrosive or reactive substances\nThe bottles serve as essential consumable infrastructure across R&D, production, quality control, and educational labs."
    }
  },
  {
    "url": "https://goelscientific.com/product/micro-filteration-assembly/",
    "title": "Micro Filteration Assembly",
    "overview": "The Micro-Filtration Assembly is a glass-based filtration module designed for very fine particulate separation or clarification tasks. It typically includes a glass housing, membrane or frit support, feed inlet, permeate outlet, retentate line, and sampling ports. The assembly is constructed from borosilicate glass to ensure chemical compatibility and visibility. It supports low-pressure operation and is suitable for small-scale laboratory filtration of colloidal suspensions, fine precipitates, or ultrafine solids where precise control and minimal contamination are essential.",
    "tabs": {
      "Key Features": "Borosilicate glass construction\nFine filtration capability\nModular design\nEasy assembly",
      "Specifications": "• Material: borosilicate glass 3.3, PTFE wetted parts\n• Operating pressure: atmospheric to 0.5–1 bar (lab-scale)\n• Membrane/frit support: glass frit, ceramic, or polymer membrane depending on design\n• Housing volume: typically small (e.g. < 1 L)\n• Port interfaces: standard glass joints and ports for feed/permeate/retentate\n• Flow rates: low volume (mL to few L/h)\n• Temperature range: ambient to ~120–150 °C (solvent dependent)\n• Sealings: PTFE gaskets or compatible seals to ensure leak resistance\n• Modular layout: removable filter element, easy cleaning, and interchangeability",
      "Applications": "• Clarification and fine filtration of reaction broths\n• Removal of fine particulates or colloids in chemical or biological samples\n• Pre-treatment before chromatography or analytical operations\n• Membrane testing or development at the lab scale\n• Filtration in pharmaceutical, biotech, or specialty chemical R&D\nThis assembly provides controlled, transparent, and modular filtration capability in sensitive lab workflows."
    }
  }
]

out_dir = Path(r"c:\Users\rewan\Downloads\eskos-phase3_1\eskos-phase3\data\seed\products")
out_dir.mkdir(parents=True, exist_ok=True)

for item in raw_data:
    title = item["title"]
    doc_id = re.sub(r'[^a-z0-9]+', '_', title.lower().strip())
    
    extracted_text = f"Title: {title}\n"
    if "overview" in item:
        extracted_text += f"Overview:\n{item['overview']}\n\n"
    for k, v in item.get("tabs", {}).items():
        extracted_text += f"{k}:\n{v}\n\n"
        
    apps = [line.strip().lstrip('• ') for line in item.get("tabs", {}).get("Applications", "").split("\n") if line.strip()]
        
    doc = {
        "doc_id": doc_id,
        "org_id": "goel-scientific",
        "extracted_text": extracted_text,
        "document_type": "product_datasheet",
        "source_category": "official_website",
        "trust_score": 95.0,
        "version": "1.0",
        "metadata": {
            "product_name": title,
            "category": "Laboratory Glassware",
            "material": "Borosilicate Glass",
            "industry": "Scientific",
            "applications": apps,
            "url": item["url"]
        }
    }
    
    with open(out_dir / f"{doc_id}.json", "w") as f:
        json.dump(doc, f, indent=2)
        
print("Seed data successfully written.")
