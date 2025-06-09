import { FC, useState, useEffect } from "react";
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  Send,
  Home,
  ShoppingCart,
  CookingPot,
} from "lucide-react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import ConfirmFooter from "@/components/ConfirmFooter";
import { useRecipe } from "@/hooks/useRecipe";
import { Box, Button, IconButton, TextField, Typography } from "@mui/material";
import { ItemList } from "@/components/ItemList";
import { getIngredientSize } from "@/utils/recipeUtils";
import { useUser } from "@/hooks/useUser";
import { Recipe } from "@/types";
import { IngredientCard } from "@/pages/Recipe/IngredientCard";
import { PreparationStepCard } from "@/pages/Recipe/RecipeFlow/PreparationStepCard";

interface ChatMessage {
  text: string;
  isUser: boolean;
}

interface RecipeFlowLocationState {
  servings?: number;
  recipe?: Recipe;
}

enum FlowStep {
  STEPS_VIEW = "steps",
  INTERACTIVE = "interactive",
  COMPLETE = "complete",
}

enum ActiveSection {
  INSTRUCTIONS = "instructions",
  CHAT = "chat",
}

const RecipeFlow: FC = () => {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const { askQuestionMutation, consumeIngredientsMutation } = useRecipe();
  const { user } = useUser();

  const [flowStep, setFlowStep] = useState<FlowStep>(FlowStep.STEPS_VIEW);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [activeSection, setActiveSection] = useState<ActiveSection>(
    ActiveSection.INSTRUCTIONS
  );
  const [isLoading, setIsLoading] = useState(true);

  const locationState = routerState.location.state as
    | RecipeFlowLocationState
    | undefined;
  const servings = locationState?.servings || 2;
  const recipe = locationState?.recipe;

  useEffect(() => {
    if (!recipe) {
      navigate({ to: "/home" });
    } else {
      setIsLoading(false);
    }
  }, [recipe, navigate]);

  useEffect(() => {
    if (recipe && flowStep === FlowStep.INTERACTIVE) {
      const currentStep = recipe.steps[currentStepIndex];
      const timerMinutes = currentStep?.timerMinutes || 0;
      const timerSeconds = timerMinutes * 60;

      setTimer(timerSeconds);
      setIsTimerRunning(false);
      setChatMessages([]);
      setActiveSection(ActiveSection.INSTRUCTIONS);
    }
  }, [currentStepIndex, flowStep, recipe]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isTimerRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      alert("הטיימר הסתיים!");
    }

    return () => clearInterval(interval);
  }, [isTimerRunning, timer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isAskingQuestion || !recipe) return;

    const currentStep = recipe.steps[currentStepIndex];
    const userMessage = inputMessage;
    setChatMessages([...chatMessages, { text: userMessage, isUser: true }]);
    setInputMessage("");
    setActiveSection(ActiveSection.CHAT);

    try {
      const answer = await askQuestionMutation.mutateAsync({
        stepInstruction: currentStep.instruction,
        question: userMessage,
        servings,
      });

      setChatMessages((prev) => [...prev, { text: answer, isUser: false }]);
    } catch (error) {
      setChatMessages((prev) => [
        ...prev,
        { text: "מצטער, אירעה שגיאה. נסה שוב.", isUser: false },
      ]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleContinue = () => {
    if (!recipe) return;

    if (flowStep === FlowStep.STEPS_VIEW) {
      setFlowStep(FlowStep.INTERACTIVE);
    } else if (flowStep === FlowStep.INTERACTIVE) {
      const isLastStep = currentStepIndex === recipe.steps.length - 1;
      if (isLastStep) {
        setFlowStep(FlowStep.COMPLETE);
      } else {
        setCurrentStepIndex(currentStepIndex + 1);
        setActiveSection(ActiveSection.INSTRUCTIONS);
      }
    }
  };

  const handleBack = () => {
    if (flowStep === FlowStep.INTERACTIVE && currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      setActiveSection(ActiveSection.INSTRUCTIONS);
    } else if (flowStep === FlowStep.INTERACTIVE && currentStepIndex === 0) {
      setFlowStep(FlowStep.STEPS_VIEW);
    } else if (flowStep === FlowStep.STEPS_VIEW) {
      (navigate as any)({
        to: "/recipe",
        state: { servings },
      });
    } else if (flowStep === FlowStep.COMPLETE) {
      setFlowStep(FlowStep.INTERACTIVE);
    }
  };

  const handleConsumeIngredients = () => {
    if (!recipe?.id) {
      console.error("Recipe has no ID, cannot consume ingredients");
      navigate({ to: "/home" });
      return;
    }

    if (!user?.id) {
      console.error("No user found, cannot consume ingredients");
      navigate({ to: "/home" });
      return;
    }

    consumeIngredientsMutation.mutate(
      {
        recipeId: recipe.id,
        servings: servings,
      },
      {
        onSuccess: () => {
          navigate({ to: "/home" });
        },
        onError: (error) => {
          console.error("Failed to consume ingredients:", error);
          navigate({ to: "/home" });
        },
      }
    );
  };

  const handleGoHome = () => {
    navigate({ to: "/home" });
  };

  if (isLoading || !recipe) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        <Typography>טוען...</Typography>
      </Box>
    );
  }

  const currentStep = recipe.steps[currentStepIndex];
  const timerMinutes = currentStep?.timerMinutes || 0;
  const timerSeconds = timerMinutes * 60;
  const hasActiveChat = chatMessages.length > 0;
  const isAskingQuestion = askQuestionMutation.isPending;

  if (flowStep === FlowStep.STEPS_VIEW) {
    return (
      <div>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "75vh",
            bgcolor: "transparent",
            direction: "rtl",
            position: "relative",
            overflow: "auto",
          }}
        >
          <Box
            sx={{
              bgcolor: "transparent",
              p: 2,
              borderBottom: "1px solid",
              borderColor: "grey.100",
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: 500,
                textAlign: "center",
                color: "text.primary",
              }}
            >
              {recipe.name}
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 3,
                mt: 1,
              }}
            >
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {servings} מנות
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {recipe.totalTimeMinutes} דקות
              </Typography>
            </Box>
            {recipe.description && (
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", textAlign: "center", mt: 1 }}
              >
                {recipe.description}
              </Typography>
            )}
          </Box>

          <Box sx={{ p: 2, flex: 1 }}>
            <Box sx={{ mb: 3 }}>
              <ItemList
                itemsCount={recipe.ingredients.length}
                title="המצרכים"
                initialCollapsed={false}
                renderRow={(index) => (
                  <IngredientCard
                    ingredientName={recipe.ingredients[index].name}
                    ingredientMeasureUnit={recipe.ingredients[index].unit}
                    ingredientSize={getIngredientSize(
                      recipe.ingredients[index],
                      servings
                    )}
                  />
                )}
                maxHeight="250px"
                cardHeight={50}
              />
            </Box>

            <ItemList
              itemsCount={recipe.steps.length}
              title="שלבי ההכנה"
              initialCollapsed={false}
              renderRow={(index) => (
                <PreparationStepCard step={recipe.steps[index]} />
              )}
              maxHeight="300px"
              cardHeight={50}
            />
          </Box>
        </Box>

        <ConfirmFooter
          onAccept={handleContinue}
          onBack={handleBack}
          onCancel={handleGoHome}
          isContinue
        />
      </div>
    );
  }

  if (flowStep === FlowStep.INTERACTIVE) {
    const isInstructionsActive = activeSection === ActiveSection.INSTRUCTIONS;
    const isChatActive = activeSection === ActiveSection.CHAT;

    return (
      <div>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "75vh",
            bgcolor: "transparent",
            direction: "rtl",
            position: "relative",
            overflow: "auto",
          }}
        >
          <Box
            sx={{
              bgcolor: "transparent",
              p: 2,
              borderBottom: "1px solid",
              borderColor: "grey.100",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 1,
                mb: 1,
              }}
            >
              {recipe.steps.map((_: any, index: number) => (
                <Box
                  key={index}
                  sx={{
                    width: index === currentStepIndex ? 32 : 8,
                    height: 8,
                    borderRadius: "4px",
                    bgcolor:
                      index === currentStepIndex
                        ? "primary.main"
                        : index < currentStepIndex
                        ? "primary.light"
                        : "grey.300",
                    transition: "all 0.3s",
                  }}
                />
              ))}
            </Box>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                display: "block",
                textAlign: "center",
              }}
            >
              שלב {currentStepIndex + 1} מתוך {recipe.steps.length}
            </Typography>
          </Box>

          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              p: 2,
              overflow: "hidden",
            }}
          >
            <Box
              onClick={() => setActiveSection(ActiveSection.INSTRUCTIONS)}
              sx={{
                bgcolor: "background.paper",
                borderRadius: "16px",
                p: 3,
                boxShadow: 1,
                mb: 2,
                flex: isInstructionsActive ? 1 : "0 0 auto",
                display: "flex",
                flexDirection: "column",
                justifyContent: isInstructionsActive ? "center" : "flex-start",
                cursor: !isInstructionsActive ? "pointer" : "default",
                transition: "all 0.3s ease",
              }}
            >
              <Typography
                variant={isInstructionsActive ? "h4" : "h6"}
                sx={{
                  fontWeight: 600,
                  textAlign: "center",
                  mb: isInstructionsActive ? 3 : 1,
                  color: "text.primary",
                  lineHeight: 1.4,
                }}
              >
                {currentStep.instruction}
              </Typography>

              {currentStep.isTimerStep && (
                <Box
                  sx={{
                    bgcolor: "primary.light",
                    borderRadius: "12px",
                    p: isInstructionsActive ? 3 : 2,
                    mt: isInstructionsActive ? 2 : 1,
                    alignSelf: "center",
                    width: isInstructionsActive ? "auto" : "100%",
                  }}
                >
                  <Box sx={{ textAlign: "center" }}>
                    <Timer
                      size={isInstructionsActive ? 32 : 24}
                      style={{ color: "white", margin: "0 auto 8px" }}
                    />
                    <Typography
                      variant={isInstructionsActive ? "h3" : "h4"}
                      sx={{ color: "white", fontWeight: 700, mb: 2 }}
                    >
                      {formatTime(timer)}
                    </Typography>
                    <Box
                      sx={{ display: "flex", justifyContent: "center", gap: 1 }}
                    >
                      <Button
                        variant="contained"
                        onClick={() => setIsTimerRunning(!isTimerRunning)}
                        endIcon={
                          isTimerRunning ? (
                            <Pause size={16} />
                          ) : (
                            <Play size={16} style={{ rotate: "180deg" }} />
                          )
                        }
                        sx={{
                          bgcolor: "white",
                          color: "#E49A61",
                          borderRadius: "25px",
                          border: "2px solid #E49A61",
                          fontWeight: 600,
                          "&:hover": {
                            boxShadow: "0 4px 12px rgba(228, 154, 97, 0.4)",
                            transform: "translateY(-1px)",
                            transition: "all 0.2s ease",
                          },
                        }}
                      >
                        <Typography
                          sx={{ marginLeft: "0.5rem", fontWeight: 600 }}
                        >
                          {isTimerRunning ? "השהה" : "התחל"}
                        </Typography>
                      </Button>
                      <Button
                        variant="contained"
                        onClick={() => {
                          setTimer(timerSeconds);
                          setIsTimerRunning(false);
                        }}
                        endIcon={<RotateCcw size={16} />}
                        sx={{
                          bgcolor: "white",
                          color: "#6b7280",
                          borderRadius: "25px",
                          border: "2px solid #d1d5db",
                          fontWeight: 600,
                          "&:hover": {
                            bgcolor: "#f3f4f6",
                            borderColor: "#9ca3af",
                            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                            transform: "translateY(-1px)",
                            transition: "all 0.2s ease",
                          },
                        }}
                      >
                        <Typography
                          sx={{ marginLeft: "0.5rem", fontWeight: 600 }}
                        >
                          אפס
                        </Typography>
                      </Button>
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>

            <Box
              onClick={() => setActiveSection(ActiveSection.CHAT)}
              sx={{
                flex: isChatActive ? 1 : "0 0 auto",
                bgcolor: "background.paper",
                borderRadius: "16px",
                boxShadow: 1,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                minHeight: isChatActive ? "auto" : 120,
                cursor: !isChatActive && hasActiveChat ? "pointer" : "default",
                transition: "all 0.3s ease",
              }}
            >
              <Box sx={{ flex: 1, p: 2, overflow: "auto" }}>
                {chatMessages.length === 0 && (
                  <Typography
                    variant="body2"
                    sx={{ textAlign: "center", color: "text.secondary", py: 2 }}
                  >
                    יש לך שאלה? אני כאן לעזור!
                  </Typography>
                )}
                {chatMessages.map((message, index) => (
                  <Box
                    key={index}
                    sx={{
                      mb: 1.5,
                      display: "flex",
                      justifyContent: message.isUser
                        ? "flex-start"
                        : "flex-end",
                    }}
                  >
                    <Box
                      sx={{
                        bgcolor: message.isUser ? "primary.main" : "grey.100",
                        color: message.isUser ? "white" : "text.primary",
                        p: 1.5,
                        borderRadius: "18px",
                        maxWidth: "80%",
                        position: "relative",
                        wordWrap: "break-word",
                        overflowWrap: "break-word",
                        width: "fit-content",
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          border: "8px solid transparent",
                          top: "100%",
                          [message.isUser ? "right" : "left"]: "15px",
                          borderTopColor: message.isUser
                            ? "#E49A61"
                            : "#f5f5f5",
                        },
                        "&::after": {
                          content: '""',
                          position: "absolute",
                          border: "7px solid transparent",
                          top: "100%",
                          [message.isUser ? "right" : "left"]: "16px",
                          borderTopColor: message.isUser
                            ? "#E49A61"
                            : "#f5f5f5",
                        },
                      }}
                    >
                      <Typography
                        variant="body2"
                        color={message.isUser ? "white" : "text.primary"}
                        sx={{
                          wordWrap: "break-word",
                          overflowWrap: "break-word",
                        }}
                      >
                        {message.text}
                      </Typography>
                    </Box>
                  </Box>
                ))}
                {isAskingQuestion && (
                  <Box
                    sx={{
                      mb: 1.5,
                      display: "flex",
                      justifyContent: "flex-end",
                    }}
                  >
                    <Box
                      sx={{
                        bgcolor: "grey.100",
                        color: "text.primary",
                        p: 1.5,
                        borderRadius: "16px",
                        maxWidth: "80%",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <Typography variant="body2">מכין תשובה...</Typography>
                    </Box>
                  </Box>
                )}
              </Box>

              <Box
                sx={{ borderTop: "1px solid", borderColor: "grey.200", p: 1.5 }}
              >
                <Box sx={{ display: "flex", gap: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isAskingQuestion}
                    placeholder={
                      isAskingQuestion ? "ממתין לתשובה..." : "שאל שאלה..."
                    }
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "25px",
                        bgcolor: "grey.50",
                        "& fieldset": { borderColor: "transparent" },
                        "&:hover fieldset": { borderColor: "grey.300" },
                        "&.Mui-focused fieldset": {
                          borderColor: "primary.main",
                        },
                      },
                    }}
                  />
                  <IconButton
                    onClick={handleSendMessage}
                    disabled={isAskingQuestion || !inputMessage.trim()}
                    sx={{
                      bgcolor:
                        isAskingQuestion || !inputMessage.trim()
                          ? "grey.300"
                          : "primary.main",
                      color: "white",
                      rotate: "270deg",
                      "&:hover": {
                        bgcolor:
                          isAskingQuestion || !inputMessage.trim()
                            ? "grey.300"
                            : "primary.dark",
                      },
                      width: "40px",
                      height: "40px",
                    }}
                  >
                    <Send
                      size={20}
                      style={{ paddingRight: "2px", paddingTop: "2px" }}
                    />
                  </IconButton>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        <ConfirmFooter
          onAccept={handleContinue}
          onBack={handleBack}
          onCancel={handleGoHome}
          isContinue
        />
      </div>
    );
  }

  if (flowStep === FlowStep.COMPLETE) {
    return (
      <div>
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            p: 3,
            height: "75vh",
          }}
        >
          <Box
            sx={{
              width: 128,
              height: 128,
              bgcolor: "primary.light",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 4,
              animation: "bounce 1s ease-in-out infinite",
              "@keyframes bounce": {
                "0%, 100%": { transform: "translateY(0)" },
                "50%": { transform: "translateY(-20px)" },
              },
            }}
          >
            <CookingPot size={64} color="white" />
          </Box>

          <Typography
            variant="h3"
            sx={{ fontWeight: 700, color: "text.primary", mb: 2 }}
          >
            בתאבון!
          </Typography>
          <Typography
            variant="h6"
            sx={{ color: "text.secondary", textAlign: "center", mb: 4 }}
          >
            מקווים שנהניתם מההכנה
            <br />
            וש{servings === 1 ? "תהנה" : "תהנו"} מהארוחה!
          </Typography>

          <Box
            sx={{
              bgcolor: "background.paper",
              borderRadius: "16px",
              p: 3,
              boxShadow: 1,
              width: "80%",
              maxWidth: 350,
              mb: 4,
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-around" }}>
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 700, color: "primary.main" }}
                >
                  {servings}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  מנות
                </Typography>
              </Box>
              <Box sx={{ width: "1px", bgcolor: "grey.200" }} />
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 700, color: "primary.main" }}
                >
                  {recipe.totalTimeMinutes}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  דקות
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              width: "100%",
              maxWidth: 350,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Button
              fullWidth
              variant="contained"
              onClick={handleConsumeIngredients}
              endIcon={<ShoppingCart size={20} />}
              disabled={consumeIngredientsMutation.isPending}
              sx={{
                bgcolor: "primary.main",
                color: "white",
                py: 2,
                borderRadius: "25px",
                textTransform: "none",
                fontSize: "16px",
                fontWeight: 600,
                "&:hover": {
                  bgcolor: "primary.dark",
                },
                "&:disabled": {
                  bgcolor: "grey.300",
                  color: "grey.500",
                },
              }}
            >
              <Typography sx={{ marginLeft: "1rem" }}>
                {consumeIngredientsMutation.isPending
                  ? "מעדכן מלאי..."
                  : "עדכן את המצרכים שהשתמשתי"}
              </Typography>
            </Button>

            <Button
              fullWidth
              variant="outlined"
              onClick={handleGoHome}
              endIcon={<Home size={20} />}
              sx={{
                borderColor: "primary.main",
                color: "primary.main",
                py: 2,
                borderRadius: "25px",
                textTransform: "none",
                fontSize: "16px",
                fontWeight: 600,
                borderWidth: 2,
                "&:hover": {
                  borderWidth: 2,
                  bgcolor: "primary.light",
                  borderColor: "primary.main",
                },
              }}
            >
              <Typography sx={{ marginLeft: "1rem" }}>
                חזרה לעמוד הבית
              </Typography>
            </Button>
          </Box>
        </Box>

        <ConfirmFooter onBack={handleBack} />
      </div>
    );
  }

  return null;
};

export default RecipeFlow;
