const express = require("express");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const flash = require("express-flash");
const app = express();

// Activation du module flash pour afficher des messages temporaires
app.use(flash());

// Configuration de Passport
passport.use(
  new LocalStrategy((username, password, done) => {
    // Fausse base de données d'utilisateur
    const fakeUser = { id: 1, username: "john", password: "motdepasse" };

    // Vérifiez les informations d'identification si password que je reçois
    // est égale au password de l'objet fakeUser alors ok
    // et si username que je reçois depuis le formulaire login correspond a username
    // du fakeUser alors j'accepte la connexion, et je renvoie le fakeUser
    if (username === fakeUser.username && password === fakeUser.password) {
      return done(null, fakeUser);
    } else {
      // si non je refuse la connexion via false et je renvoie un message d'erreur personnalisé
      return done(null, false, {
        message: "Nom d'utilisateur ou mot de passe incorrect",
      });
    }
  })
);

// c'est ma fonction qui wrappe elle meme la fonction req.isAuthenticated qui viens de passport
// en clair , si passport dis que c'est ok (req.isAuthenticated = true)
// alors ont peut lancer next() c'est à dire la suite des evenements
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  // si non par défaut , je suis rediriger vers /login
  res.redirect("/login");
};

// ici je créer mon utilisateur dans la session active, avec son id
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// ici ça me permet de récuperer mon user pour la session, je lui enleve son mot de passe par sécurité
passport.deserializeUser((id, done) => {
  // Dans une vraie application, cela récupérerait l'utilisateur de la base de données
  const fakeUser = { id: 1, username: "john", password: "johndoe" };
  done(null, fakeUser);
});

// Configuration d'Express
app.set("view engine", "pug");
app.set("views", "./views"); // Chemin vers le dossier des vues

// configuration d'Express session pour que ça marche avec passport
app.use(
  require("express-session")({
    secret: "votre-secret",
    resave: true,
    saveUninitialized: true,
  })
);
// l'applicationtion va utiliser en plus du json le format urlencoded
app.use(express.urlencoded({ extended: true }));
// on initialise passport dans notre application
app.use(passport.initialize());
// et on initialise la possibilité d'utiliser la session de passport avec express-session
app.use(passport.session());

// Routes vers l'accueil
app.get("/", (req, res) => {
  res.send("Accueil");
});

// routes vers le login
app.get("/login", (req, res) => {
  res.render("login");
});

// route privée vers le dasboard (grace à notre méthode qui elle meme wrappe isAuthenticated de passport)
app.get("/dashboard", isAuthenticated, (req, res) => {
  const user = req.user;
  // si c'est ok , alors je rend le dashboard/index en envoyant l'user en tant que variable disponible pour le front
  res.render("dashboard/index", { user });
  // res.send("Tableau de bord - Utilisateur connecté: " + req.user.username);
});

// ici quand je post sur le endpoint /login , passport authentifie avec la stratégie local
// si c ok = je vais sur dashboard
// si c faux je vais sur login
// si il y a une erreur renvoie moi le message personnalisé que j'ai écris auparavant
app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/dashboard", // Redirige vers le tableau de bord en cas de succès
    failureRedirect: "/login",
    failureFlash: true,
  })
);

// Lancement du serveur
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur http://localhost:${PORT}`);
});
