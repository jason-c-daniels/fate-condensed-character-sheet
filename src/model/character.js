export default function getNewCharacter() {
    return {
        name: "",
        fate: 3,
        refresh: 3,
        aspects: {
            highConcept: "",
            trouble: "",
            relationship: "",
            otherAspects: ["", ""]
        },
        skills: [
            {name: "Academics", value: 0},
            {name: "Athletics", value: 0},
            {name: "Burglary", value: 0},
            {name: "Contacts", value: 0},
            {name: "Crafts", value: 0},
            {name: "Deceive", value: 0},
            {name: "Drive", value: 0},
            {name: "Empathy", value: 0},
            {name: "Fight", value: 0},
            {name: "Investigate", value: 0},
            {name: "Lore", value: 0},
            {name: "Notice", value: 0},
            {name: "Physique", value: 0},
            {name: "Provoke", value: 0},
            {name: "Rapport", value: 0},
            {name: "Resources", value: 0},
            {name: "Shoot", value: 0},
            {name: "Stealth", value: 0},
            {name: "Will", value: 0}
        ],
        stunts: [
            {name: "", description: ""},
            {name: "", description: ""},
            {name: "", description: ""},
            {name: "", description: ""},
            {name: "", description: ""},
            {name: "", description: ""}
        ],
        vitals: {
            physicalStressTaken: 0,
            mentalStressTaken: 0,
            consequences: {
                mild1: "",
                moderate: "",
                severe: "",
                mild2: "",
            }
        }
    };
}