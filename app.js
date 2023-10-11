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

    // Vérifiez les informations d'identification
    if (username === fakeUser.username && password === fakeUser.password) {
      return done(null, fakeUser);
    } else {
      return done(null, false, {
        message: "Nom d'utilisateur ou mot de passe incorrect",
      });
    }
  })
);

const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
};

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  // Dans une vraie application, cela récupérerait l'utilisateur de la base de données
  const fakeUser = { id: 1, username: "john" };
  done(null, fakeUser);
});

// Configuration d'Express
app.set("view engine", "pug");
app.set("views", "./views"); // Chemin vers le dossier des vues

app.use(
  require("express-session")({
    secret: "votre-secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.get("/", (req, res) => {
  res.send("Accueil");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/dashboard", isAuthenticated, (req, res) => {
  const user = req.user;
  res.render("dashboard/index", { user });
  // res.send("Tableau de bord - Utilisateur connecté: " + req.user.username);
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/dashboard", // Redirige vers le tableau de bord en cas de succès
    failureRedirect: "/login",
    failureFlash: true,
  })
);

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/profil",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

// Lancement du serveur
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur http://localhost:${PORT}`);
});
