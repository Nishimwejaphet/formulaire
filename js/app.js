const GOOGLE_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbzQdJO_l8TyqS8Egfm3kQXjOfSWFZ0tr59PCdqd4Q8X0jDvNLDazUVkj4hCmB2WtiY78Q/exec";


// ======================================================
// ELEMENTS HTML
// ======================================================

const form = document.getElementById("applicationForm");

const nextButton = document.getElementById("nextButton");
const prevButton = document.getElementById("prevButton");
const stepCounter = document.getElementById("stepCounter");

const progressBar = document.getElementById("progressBar");

const formSteps =
    document.querySelectorAll(".form-step");

const stepIndicators =
    document.querySelectorAll(".steps .step");


// ======================================================
// API PAYS / UNIVERSITÉS
// ======================================================

const paysSelect =
    document.getElementById("pays");

const universiteSelect =
    document.getElementById("universite");

const countryStatus =
    document.getElementById("countryStatus");

const universityStatus =
    document.getElementById("universityStatus");


// ======================================================
// AUTRES ELEMENTS
// ======================================================

const cvInput =
    document.getElementById("cv");

const fileName =
    document.getElementById("fileName");

const consent =
    document.getElementById("consent");


// ======================================================
// NAVIGATION
// ======================================================

let currentStep = 1;

const totalSteps = 5;


// ======================================================
// AFFICHER UNE ETAPE
// ======================================================

function afficherEtape(numero) {

    currentStep = numero;


    // ----------------------------------------------
    // Afficher la bonne étape
    // ----------------------------------------------

    formSteps.forEach(step => {

        const stepNumber =
            Number(step.dataset.step);

        if (stepNumber === numero) {

            step.classList.add("active");

        } else {

            step.classList.remove("active");

        }

    });


    // ----------------------------------------------
    // Indicateurs des étapes
    // ----------------------------------------------

    stepIndicators.forEach((step, index) => {

        const number = index + 1;

        step.classList.remove("active");
        step.classList.remove("completed");


        if (number === numero) {

            step.classList.add("active");

        }


        if (number < numero) {

            step.classList.add("completed");

        }

    });


    // ----------------------------------------------
    // Barre de progression
    // ----------------------------------------------

    const percentage =
        ((numero - 1) / (totalSteps - 1)) * 100;

    progressBar.style.width =
        percentage + "%";


    // ----------------------------------------------
    // Compteur
    // ----------------------------------------------

    stepCounter.textContent =
        `Étape ${numero} sur ${totalSteps}`;


    // ----------------------------------------------
    // Bouton précédent
    // ----------------------------------------------

    if (numero === 1) {

        prevButton.disabled = true;

    } else {

        prevButton.disabled = false;

    }


    // ----------------------------------------------
    // Texte du bouton suivant
    // ----------------------------------------------

    if (numero === totalSteps) {

        nextButton.textContent =
            "Envoyer ma candidature ✓";

    } else {

        nextButton.textContent =
            "Continuer →";

    }


    // ----------------------------------------------
    // Si étape 5 : afficher le résumé
    // ----------------------------------------------

    if (numero === 5) {

        afficherResume();

    }

}



function validerEtape(numero) {

    const currentFormStep =
        document.querySelector(
            `.form-step[data-step="${numero}"]`
        );


    if (!currentFormStep) {

        return false;

    }


    const champs =
        currentFormStep.querySelectorAll(
            "input, select, textarea"
        );


    for (const champ of champs) {

        if (!champ.checkValidity()) {

            champ.reportValidity();

            champ.focus();

            return false;

        }

    }


    return true;

}


// ======================================================
// BOUTON CONTINUER
// ======================================================

nextButton.addEventListener(
    "click",
    async function () {


        // ----------------------------------------------
        // Etapes 1 à 4
        // ----------------------------------------------

        if (currentStep < totalSteps) {


            if (!validerEtape(currentStep)) {

                return;

            }


            currentStep++;

            afficherEtape(currentStep);


            document
                .getElementById("candidature")
                .scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });


            return;

        }


        // ----------------------------------------------
        // ETAPE 5
        // ----------------------------------------------

        if (currentStep === 5) {

            await envoyerCandidature();

        }

    }
);


// ======================================================
// BOUTON RETOUR
// ======================================================

prevButton.addEventListener(
    "click",
    function () {


        if (currentStep > 1) {

            currentStep--;

            afficherEtape(currentStep);


            document
                .getElementById("candidature")
                .scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

        }

    }
);


// ======================================================
// API DES PAYS
// ======================================================

async function chargerPays() {

    countryStatus.textContent =
        "Connexion à l'API des pays...";


    paysSelect.innerHTML =
        '<option value="">Chargement des pays...</option>';


    try {

        const response = await fetch(
            "api/pays.php"
        );


        if (!response.ok) {

            throw new Error(
                "Erreur HTTP : " +
                response.status
            );

        }


        const result =
    await response.json();

const countries =
    result.data.objects;


        // ----------------------------------------------
        // Vérification
        // ----------------------------------------------

        if (!Array.isArray(countries)) {

            throw new Error(
                "Réponse incorrecte de l'API."
            );

        }


        // ----------------------------------------------
        // Trier les pays
        // ----------------------------------------------

        countries.sort(
            (a, b) =>
                a.names.common.localeCompare(
                    b.names.common
                )
        );


        // ----------------------------------------------
        // Nettoyer la liste
        // ----------------------------------------------

        paysSelect.innerHTML =
            '<option value="">-- Choisissez un pays --</option>';


        // ----------------------------------------------
        // Ajouter les pays
        // ----------------------------------------------

        countries.forEach(country => {

            if (!country.names ||
                !country.names.common) {

                return;

            }


            const option =
                document.createElement("option");


            option.value =
                country.names.common;


            option.textContent =
                country.names.common;


            option.dataset.code =
                country.codes.alpha_2 || "";


            paysSelect.appendChild(option);

        });


        countryStatus.textContent =
            `${countries.length} pays disponibles ✓`;

    }


    catch (error) {

        console.error(
            "Erreur API pays :",
            error
        );


        paysSelect.innerHTML =
            '<option value="">Impossible de charger les pays</option>';


        countryStatus.textContent =
            "❌ Impossible de charger les pays.";

    }

}


// ======================================================
// API DES UNIVERSITÉS
// ======================================================

async function chargerUniversites(pays) {


    universiteSelect.disabled = true;


    universiteSelect.innerHTML =
        '<option value="">Chargement des universités...</option>';


    universityStatus.textContent =
        "Recherche des universités...";


    try {


        const url =
            "api/universites.php?country=" +
            encodeURIComponent(pays);


        console.log(
            "API universités :",
            url
        );


        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(
                "Erreur HTTP : " +
                response.status
            );

        }


        const result =
    await response.json();

if (!result.success) {
    throw new Error(
        result.message ||
        "Erreur lors de la récupération des universités."
    );
}

const universities =
    result.data;

        if (!Array.isArray(universities)) {

            throw new Error(
                "Réponse incorrecte de l'API."
            );

        }



        universiteSelect.innerHTML =
            '<option value="">-- Choisissez une université --</option>';


        // ----------------------------------------------
        // Aucune université
        // ----------------------------------------------

        if (universities.length === 0) {

            universiteSelect.innerHTML =
                '<option value="">Aucune université trouvée</option>';


            universityStatus.textContent =
                `Aucune université trouvée pour ${pays}`;


            return;

        }


        // ----------------------------------------------
        // Supprimer les doublons
        // ----------------------------------------------

        const universitesUniques =
            Array.from(
                new Map(
                    universities.map(university => [
                        university.name,
                        university
                    ])
                ).values()
            );


        // ----------------------------------------------
        // Trier
        // ----------------------------------------------

        universitesUniques.sort(
            (a, b) =>
                a.name.localeCompare(
                    b.name
                )
        );


        // ----------------------------------------------
        // Ajouter les universités
        // ----------------------------------------------

        universitesUniques.forEach(
            university => {


                if (!university.name) {

                    return;

                }


                const option =
                    document.createElement("option");


                option.value =
                    university.name;


                option.textContent =
                    university.name;


                // Informations supplémentaires
                option.dataset.country =
                    university.country || pays;


                option.dataset.website =
                    university.web_pages?.[0] || "";


                universiteSelect.appendChild(option);

            }
        );


        universiteSelect.disabled =
            false;


        universityStatus.textContent =
            `${universitesUniques.length} université(s) trouvée(s) ✓`;

    }


    catch (error) {

        console.error(
            "Erreur API universités :",
            error
        );


        universiteSelect.innerHTML =
            '<option value="">Erreur de chargement</option>';


        universityStatus.textContent =
            "❌ Impossible de récupérer les universités.";

    }

}


// ======================================================
// CHANGEMENT DE PAYS
// ======================================================

paysSelect.addEventListener(
    "change",
    function () {


        const pays =
            this.value;


        // ----------------------------------------------
        // Aucun pays
        // ----------------------------------------------

        if (!pays) {

            universiteSelect.disabled =
                true;


            universiteSelect.innerHTML =
                '<option value="">Sélectionnez d’abord un pays</option>';


            universityStatus.textContent =
                "Les universités apparaîtront après le choix du pays.";


            return;

        }


        // ----------------------------------------------
        // Charger les universités
        // ----------------------------------------------

        chargerUniversites(pays);

    }
);


// ======================================================
// GESTION DU CV
// ======================================================

cvInput.addEventListener(
    "change",
    function () {


        if (this.files.length === 0) {

            fileName.textContent =
                "Aucun fichier sélectionné";

            return;

        }


        const file =
            this.files[0];


        // ----------------------------------------------
        // Taille maximale : 5 MB
        // ----------------------------------------------

        const maxSize =
            5 * 1024 * 1024;


        if (file.size > maxSize) {

            alert(
                "Le CV ne doit pas dépasser 5 MB."
            );


            this.value = "";


            fileName.textContent =
                "Aucun fichier sélectionné";


            return;

        }


        // ----------------------------------------------
        // Vérifier le type
        // ----------------------------------------------

        const allowedTypes = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ];


        if (
            !allowedTypes.includes(file.type) &&
            !file.name.match(/\.(pdf|doc|docx)$/i)
        ) {

            alert(
                "Format non autorisé. Utilisez PDF, DOC ou DOCX."
            );


            this.value = "";


            fileName.textContent =
                "Aucun fichier sélectionné";


            return;

        }


        // ----------------------------------------------
        // Afficher le nom
        // ----------------------------------------------

        fileName.textContent =
            "✓ " + file.name;

    }
);


// ======================================================
// AFFICHER LE RESUME
// ======================================================

function afficherResume() {


    const nom =
        document.getElementById("nom").value.trim();


    const prenom =
        document.getElementById("prenom").value.trim();


    const email =
        document.getElementById("email").value.trim();


    const pays =
        document.getElementById("pays").value;


    const universite =
        document.getElementById("universite").value;


    const niveau =
        document.getElementById("niveau").value;


    const poste =
        document.getElementById("poste").value.trim();


    // ----------------------------------------------
    // Nom complet
    // ----------------------------------------------

    document.getElementById(
        "summaryName"
    ).textContent =
        `${prenom} ${nom}`;


    // ----------------------------------------------
    // Email
    // ----------------------------------------------

    document.getElementById(
        "summaryEmail"
    ).textContent =
        email || "—";


    // ----------------------------------------------
    // Pays
    // ----------------------------------------------

    document.getElementById(
        "summaryCountry"
    ).textContent =
        pays || "—";


    // ----------------------------------------------
    // Université
    // ----------------------------------------------

    document.getElementById(
        "summaryUniversity"
    ).textContent =
        universite || "—";


    // ----------------------------------------------
    // Niveau
    // ----------------------------------------------

    document.getElementById(
        "summaryLevel"
    ).textContent =
        niveau || "—";


    // ----------------------------------------------
    // Poste
    // ----------------------------------------------

    document.getElementById(
        "summaryJob"
    ).textContent =
        poste || "—";

}


// ======================================================
// RECUPERER TOUTES LES DONNEES
// ======================================================

function recupererDonnees() {


    const donnees = {};


    // ----------------------------------------------
    // Tous les champs du formulaire
    // ----------------------------------------------

    const champs =
        form.querySelectorAll(
            "input, select, textarea"
        );


    champs.forEach(champ => {


        // Ignorer le bouton
        if (
            champ.type === "button" ||
            champ.type === "submit"
        ) {

            return;

        }


        // Fichier
        if (champ.type === "file") {

            if (champ.files.length > 0) {

                donnees[champ.name] =
                    champ.files[0].name;

            } else {

                donnees[champ.name] = "";

            }

            return;

        }


        // Checkbox
        if (champ.type === "checkbox") {

            donnees[champ.name || champ.id] =
                champ.checked;

            return;

        }


        // Autres champs
        donnees[champ.name || champ.id] =
            champ.value.trim();

    });


    return donnees;

}


// ======================================================
// ENVOYER LA CANDIDATURE
// ======================================================

async function envoyerCandidature() {


    // ----------------------------------------------
    // Vérifier le consentement
    // ----------------------------------------------

    if (!consent.checked) {

        alert(
            "Veuillez confirmer que les informations fournies sont exactes."
        );

        consent.focus();

        return;

    }


    // ----------------------------------------------
    // Vérifier l'étape 5
    // ----------------------------------------------

    if (!validerEtape(5)) {

        return;

    }


    // ----------------------------------------------
    // Récupérer les données
    // ----------------------------------------------

    const donnees =
        recupererDonnees();


    console.log(
        "Données candidature :",
        donnees
    );


    // ----------------------------------------------
    // Confirmation
    // ----------------------------------------------

    const confirmation =
        confirm(
            "Voulez-vous réellement envoyer votre candidature ?\n\n" +
            "Après confirmation, vos informations seront transmises."
        );


    if (!confirmation) {

        return;

    }


    // ----------------------------------------------
    // Désactiver le bouton
    // ----------------------------------------------

    nextButton.disabled =
        true;


    nextButton.textContent =
        "Envoi en cours...";


    try {


        // ------------------------------------------
        // Envoyer à Google Apps Script
        // ------------------------------------------

        const response =
            await fetch(
                GOOGLE_SCRIPT_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "text/plain;charset=utf-8"
                    },

                    body:
                        JSON.stringify(donnees)
                }
            );


        // ------------------------------------------
        // Lire la réponse
        // ------------------------------------------

        const texte =
            await response.text();


        console.log(
            "Réponse Google Apps Script :",
            texte
        );


        let resultat;


        try {

            resultat =
                JSON.parse(texte);

        }

        catch {

            resultat = {
                success: true,
                message:
                    "Candidature envoyée."
            };

        }


        // ------------------------------------------
        // Résultat
        // ------------------------------------------

        if (
            resultat.success === false
        ) {

            throw new Error(
                resultat.message ||
                "Erreur lors de l'enregistrement."
            );

        }


        // ------------------------------------------
        // Succès
        // ------------------------------------------

        alert(
            "✅ CANDIDATURE ENVOYÉE !\n\n" +
            "Votre candidature a été enregistrée avec succès."
        );


        nextButton.textContent =
            "Candidature envoyée ✓";


        // Empêcher un deuxième envoi
        nextButton.disabled =
            true;


    }


    catch (error) {


        console.error(
            "Erreur d'envoi :",
            error
        );


        alert(
            "❌ Une erreur est survenue lors de l'envoi.\n\n" +
            "Vérifiez votre connexion et la configuration de Google Apps Script."
        );


        nextButton.disabled =
            false;


        nextButton.textContent =
            "Envoyer ma candidature ✓";

    }

}


// ======================================================
// INITIALISATION
// ======================================================


// Afficher l'étape 1
afficherEtape(1);


// Charger les pays
chargerPays();