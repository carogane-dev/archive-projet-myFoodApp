import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet } from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../config/firebaseConfig"; // Assurez-vous que db est bien importé de firebase
import { useRouter } from "expo-router";
import { doc, setDoc } from "firebase/firestore"; // Pour manipuler Firestore

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pseudo, setPseudo] = useState(""); // Nouveau champ pour le pseudo
  const router = useRouter();

  const handleRegister = async () => {
    try {
      // Créer l'utilisateur avec email et mot de passe
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user; // Récupère l'utilisateur créé

      // Créer un document Firestore avec des informations supplémentaires
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,     // L'email de l'utilisateur
        pseudo: pseudo || "",  // Le pseudo (vide par défaut)
        poids: "",             // Poids (vide au début)
      });

      // Rediriger l'utilisateur vers la page d'accueil après inscription
      router.push("/");  

    } catch (error: any) {  // Ajouter `: any` pour éviter les erreurs de type sur `error`
      // Vérification si l'objet error contient la propriété message
      const errorMessage = error.message ? error.message : "Une erreur inconnue est survenue";
      console.error("Erreur lors de l'inscription :", errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Pseudo"  // Champ pour le pseudo
        value={pseudo}
        onChangeText={setPseudo}
      />
      <Button title="S'inscrire" onPress={handleRegister} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    justifyContent: "center",
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 12,
    paddingLeft: 8,
  },
});
