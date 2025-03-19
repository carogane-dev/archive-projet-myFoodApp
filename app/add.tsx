import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";
import DateTimePicker from '@react-native-community/datetimepicker'; // Import du DateTimePicker
import { addFoodToDatabase } from "./addFoodToDatabase"; // Import de la fonction réutilisable
import { getAuth } from "firebase/auth"; // Récupérer l'utilisateur connecté

export default function AddFood() {
  const [name, setName] = useState("");
  const [weight, setWeight] = useState("");
  const [quantity, setQuantity] = useState("1"); // Quantité par défaut 1
  const [description, setDescription] = useState("");
  const [expiryDate, setExpiryDate] = useState(new Date()); // Date initiale
  const [showDatePicker, setShowDatePicker] = useState(false); // Gérer l'affichage du DatePicker
  const [productCategory, setProductCategory] = useState(""); // Catégorie du produit
  const [productBrand, setProductBrand] = useState(""); // Marque du produit
  const [productIngredients, setProductIngredients] = useState(""); // Ingrédients
  const [productImage, setProductImage] = useState(""); // Image du produit
  const [productNutrients, setProductNutrients] = useState({}); // Nutriments

  const router = useRouter();
  const auth = getAuth();
  const user = auth.currentUser;

  const onDateChange = (event: any, selectedDate: Date | undefined) => {
    if (selectedDate) {
      setExpiryDate(selectedDate);
    }
    setShowDatePicker(false); // Fermer le sélecteur de date après sélection
  };

  const getButtonStyle = () => {
    const currentHour = new Date().getHours();
    if (currentHour >= 6 && currentHour < 18) {
      return styles.dayButton; // Couleur pour la journée
    } else {
      return styles.nightButton; // Couleur pour la nuit
    }
  };

  // Fonction qui va gérer l'ajout du produit avec des valeurs par défaut pour les champs manquants
  const addFoodHandler = async () => {
    // Vérification des informations de l'utilisateur
    if (!user) {
      console.error("Utilisateur non connecté");
      return;
    }

    // Valeurs par défaut pour les champs manquants
    const expiryDateString = expiryDate.toISOString(); // La date au format ISO
    const productNutrientsFiltered = productNutrients || {}; // Utilisation des nutriments, vide s'il n'y en a pas
    const detectedCategory = productCategory || "Autres"; // Valeur par défaut pour la catégorie
    const imageUrl = productImage || ""; // Valeur par défaut pour l'image
    const brand = productBrand || "Marque non précisée"; // Marque par défaut
    const ingredients = productIngredients || "Ingrédients non précisés"; // Ingrédients par défaut

    // Ajouter le produit à la base de données
    await addFoodToDatabase(
      user.uid,  // Utilisation de l'UID de l'utilisateur connecté
      name,  // Le nom est obligatoire
      weight,  // Le poids est obligatoire
      quantity,  // Quantité
      description,  // Description
      expiryDateString,  // Passer la date convertie en chaîne ISO
      imageUrl,  // Image du produit (par défaut vide si non spécifiée)
      brand,  // Marque (par défaut "Marque non précisée")
      ingredients,  // Ingrédients (par défaut "Ingrédients non précisés")
      productNutrientsFiltered,  // Nutriments filtrés
      detectedCategory  // Catégorie (par défaut "Autres")
    );

    // Redirection vers la page de succès après ajout
  };

  return (
    <View style={styles.container}>
      {/* Nom de l'aliment */}
      <TextInput
        placeholder="Nom de l'aliment"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      
      {/* Poids de l'aliment */}
      <TextInput
        placeholder="Poids (en kg)"
        value={weight}
        onChangeText={setWeight}
        style={styles.input}
        keyboardType="numeric"
      />

      {/* Quantité de l'aliment */}
      <TextInput
        placeholder="Quantité"
        value={quantity}
        onChangeText={setQuantity}
        style={styles.input}
        keyboardType="numeric"
      />

      {/* Description du produit */}
      <TextInput
        placeholder="Description (facultatif)"
        value={description}
        onChangeText={setDescription}
        style={styles.input}
      />
      
      {/* Sélecteur de date de péremption */}
      <Button 
        title={`Date de péremption: ${expiryDate.toLocaleDateString()}`} 
        onPress={() => setShowDatePicker(true)} 
        color={getButtonStyle().backgroundColor} 
      />

      {/* Affichage du DateTimePicker sous forme de roue */}
      {showDatePicker && (
        <DateTimePicker
          value={expiryDate}
          mode="date" // Mode "date" pour afficher jour/mois/année
          display="spinner" // Affichage sous forme de roue
          onChange={onDateChange}
          style={{ backgroundColor: 'transparent' }} // Garde le fond transparent
          textColor="black" // Change la couleur du texte
        />
      )}

      <Button title="Ajouter" onPress={addFoodHandler} color="#4CAF50" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f4f4f4",
  },
  input: {
    height: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 10,
    fontSize: 18,
    marginBottom: 20,
    backgroundColor: "#fff",
  },
  dayButton: {
    backgroundColor: "#2196F3", // Bleu clair pour la journée
  },
  nightButton: {
    backgroundColor: "#0D47A1", // Bleu foncé pour la nuit
  },
});
