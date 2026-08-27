const paysSelect = document.getElementById("pays");
const universiteSelect = document.getElementById("universite");

const countryStatus = document.getElementById("countryStatus");
const universityStatus = document.getElementById("universityStatus");


// ==========================================
// API DES PAYS
// ==========================================

async function chargerPays() {

    try {

        countryStatus.textContent = "Connexion à l'API...";

        const response = await fetch(
            "https://restcountries.com/v3.1/all?fields=name,cca2"
        );

        if (!response.ok) {
            throw new Error("Impossible de récupérer les pays.");
        }

        const countries = await response.json();

        countries.sort((a, b) =>
            a.name.common.localeCompare(b.name.common)
        );

        paysSelect.innerHTML =
            '<option value="">-- Choisissez un pays --</option>';

        countries.forEach(country => {

            const option = document.createElement("option");

            option.value = country.name.common;
            option.textContent = country.name.common;

            paysSelect.appendChild(option);
        });

        countryStatus.textContent =
            ${countries.length} pays disponibles;

    } catch (error) {

        console.error(error);

        paysSelect.innerHTML =
            '<option value="">Erreur de chargement</option>';

        countryStatus.textContent =
            "Impossible de charger les pays.";

    }
}


// ==========================================
// API DES UNIVERSITÉS
// ==========================================

async function chargerUniversites(pays) {

    universiteSelect.disabled = true;

    universiteSelect.innerHTML =
        '<option value="">Chargement des universités...</option>';

    universityStatus.textContent =
        "Recherche des universités...";

    try {

        const url =
            https://universities.hipolabs.com/search?country=${encodeURIComponent(pays)};

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Erreur API universités.");
        }

        const universities = await response.json();

        universiteSelect.innerHTML =
            '<option value="">-- Choisissez une université --</option>';

        if (universities.length === 0) {

            universiteSelect.innerHTML =
                '<option value="">Aucune université trouvée</option>';

            universityStatus.textContent =
                "Aucune université trouvée pour ce pays.";

            return;
        }

        universities
            .sort((a, b) =>
                a.name.localeCompare(b.name)
            )
            .forEach(university => {

                const option = document.createElement("option");

                option.value = university.name;
                option.textContent = university.name;

                universiteSelect.appendChild(option);
            });

        universiteSelect.disabled = false;

        universityStatus.textContent =
            ${universities.length} université(s) trouvée(s);

    } catch (error) {

        console.error(error);

        universiteSelect.innerHTML =
            '<option value="">Erreur de chargement</option>';

        universityStatus.textContent =
            "Impossible de récupérer les universités.";
    }
}


// ==========================================
// CHANGEMENT DE PAYS
// ==========================================

paysSelect.addEventListener("change", function () {

    const pays = this.value;

    if (!pays) {

        universiteSelect.disabled = true;

        universiteSelect.innerHTML =
            '<option value="">Sélectionnez d'abord un pays</option>';

        universityStatus.textContent =
            "Les universités apparaîtront après le choix du pays.";

        return;
    }

    chargerUniversites(pays);

});


// ==========================================
// FORMULAIRE
// ==========================================

document
    .getElementById("applicationForm")
    .addEventListener("submit", function(event) {

        event.preventDefault();

        const nom =
            document.getElementById("nom").value.trim();

        const prenom =
            document.getElementById("prenom").value.trim();

        const email =
            document.getElementById("email").value.trim();

        const pays =
            paysSelect.value;

        const universite =
            universiteSelect.value;


        if (!nom || !prenom || !email || !pays || !universite) {

            alert(
                "Veuillez compléter tous les champs obligatoires."
            );

            return;
        }


        alert(
            Excellent ${prenom} ${nom} !\n\n +
            Pays : ${pays}\n +
            Université : ${universite}\n\n +
            Étape suivante : informations professionnelles.
        );

    });


// ==========================================
// INITIALISATION
// ==========================================

chargerPays();