document
  .getElementById("register-form")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("register-name").value.trim();
    const email = document.getElementById("register-email").value.trim();
    const password = document.getElementById("register-password").value.trim();
    const password2 = document
      .getElementById("register-password2")
      .value.trim();
    const spinner = document.querySelector(".spinner");
    const textButton = document.querySelector(".text-button");
    const submitButton = document.querySelector("button[type='submit']");
    const snackbar = document.getElementById("snackbar");

    spinner.style.display = "block";
    submitButton.disabled = true;
    textButton.style.display = "none";
    submitButton.classList.add("loading");

    if (!password || !password2 || password !== password2) {
      submitButton.disabled = false;
      submitButton.classList.remove("loading");
      showSnackbar("As senhas não coincidem.", "error");
      return;
    }
    fetch("https://sustenteco.onrender.com/api/users/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password, password2 }),
    })
      .then((response) => {
        if (response.status === 401) {
          throw new Error(
            "Você não tem permissão para registrar. Por favor, verifique suas credenciais."
          );
        }
        return response.json();
      })
      .then((data) => {
        console.log("Resposta do backend:", data);
        spinner.style.display = "none";
        submitButton.disabled = false;
        submitButton.classList.remove("loading");
        textButton.style.display = "inline-block";

        if (data.res === "Success" || data.res === "Suceccs") {
          showSnackbar(
            "Registro bem-sucedido! Por favor, faça login.",
            "success"
          );
          setTimeout(() => {
            window.location.href = "/telas/login/index.html";
          }, 1000);
        } else if (data.register && data.register.errors) {
          const errors = data.register.errors
            .map((error) => error.message)
            .join(", ");
          showSnackbar(errors, "error");
        } else {
          showSnackbar(
            "Erro no registro. Por favor, tente novamente.",
            "error"
          );
        }
      })
      .catch((error) => {
        spinner.style.display = "none";
        submitButton.disabled = false;
        submitButton.classList.remove("loading");
        textButton.style.display = "inline-block";
        showSnackbar("Erro ao fazer registro: " + error.message, "error");
        console.error("Erro ao fazer registro:", error);
      });

    function showSnackbar(message, type) {
      snackbar.textContent = message;
      snackbar.style.backgroundColor = type === "success" ? "green" : "red";
      snackbar.className = "snackbar show";
      setTimeout(() => {
        snackbar.className = snackbar.className.replace("show", "");
      }, 3000);
    }
  });

document
  .getElementById("toggle-password")
  .addEventListener("click", function () {
    const passwordInput = document.getElementById("register-password");
    const icon = this;

    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      icon.classList.remove("fa-eye");
      icon.classList.add("fa-eye-slash");
    } else {
      passwordInput.type = "password";
      icon.classList.remove("fa-eye-slash");
      icon.classList.add("fa-eye");
    }
  });

document
  .getElementById("toggle-password2")
  .addEventListener("click", function () {
    const passwordInput = document.getElementById("register-password2");
    const icon = this;

    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      icon.classList.remove("fa-eye");
      icon.classList.add("fa-eye-slash");
    } else {
      passwordInput.type = "password";
      icon.classList.remove("fa-eye-slash");
      icon.classList.add("fa-eye");
    }
  });
