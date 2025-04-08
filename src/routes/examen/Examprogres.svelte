<script lang="ts">
    export let currentQuestion: number;
    export let totalQuestions: number;
    export let answers: {[key: number]: string};
  
    $: progress = (currentQuestion / totalQuestions) * 100;
    $: answeredQuestions = Object.keys(answers).length;

    //hacer un  console log dinamico
    $: console.log('new',answers[1]);

    


    
</script>
  
<div class="progress-container glow-effect card_color">
    <div class="progress-header">
      <span>Pregunta {currentQuestion} de {totalQuestions}</span>
      <span>{answeredQuestions} respondidas</span>
    </div>
    
    <div class="progress-bar-container">
      <div 
        class="progress-bar"
        style="width: {progress}%"
      ></div>
    </div>
    
    <div class="question-indicators">
      {#each Array(totalQuestions) as _, i}
        <div 
          class="indicator"
          class:current={i + 1 === currentQuestion}
          class:answeredCorrect={answers[i + 1] === 'true'}
          class:answeredIncorrect={answers[i + 1] === 'false'}
          class:unanswered={!answers[i + 1] && i + 1 !== currentQuestion}
         
        ></div>
      {/each}
    </div>
</div>

<style>
  .progress-container {
    margin-bottom: 1.5rem;
    padding: 1rem;
    border-radius: 0.5rem;
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;
    width: 100%;
    max-width: 100%;
  }

  .progress-header {
    display: flex;
    justify-content: space-between;
    font-size: 0.875rem;
    color: rgb(209, 213, 219);
    margin-bottom: 0.75rem;
  }

  .progress-bar-container {
    height: 0.5rem;
    background-color: #1f2937;
    border-radius: 999px;
    overflow: hidden;
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.2);
  }

  .progress-bar {
    height: 100%;
    background: linear-gradient(to right, #3b82f6, #fbbf24);
    border-radius: 999px;
    transition: width 0.4s ease;
    box-shadow: 0 0 8px rgba(59, 130, 246, 0.5);
  }

  .question-indicators {
    display: flex;
    gap: 0.25rem;
    margin-top: 1rem;
    overflow-x: auto;
    padding-bottom: 0.5rem;
    -ms-overflow-style: none; /* for Internet Explorer, Edge */
    scrollbar-width: thin;
    flex-wrap: wrap;
  }

  .indicator {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    flex-shrink: 0;
    transition: all 0.3s ease;
  }

  .current {
    background-color: #fbbf24;
    transform: scale(1.2);
    box-shadow: 0 0 8px rgba(251, 191, 36, 0.6);
  }

  .answeredCorrect {
    background-color: #aaee6a;
    box-shadow: 0 0 4px rgba(59, 130, 246, 0.4);
  }
  .answeredIncorrect {
    background-color: #ef4444;
    box-shadow: 0 0 4px rgba(239, 68, 68, 0.4);
  }

  .unanswered {
    background-color: #1f2937;
  }

  .question-indicators::-webkit-scrollbar {
    height: 4px;
  }

  .question-indicators::-webkit-scrollbar-thumb {
    background-color: #4b5563;
    border-radius: 10px;
  }

  .question-indicators::-webkit-scrollbar-track {
    background-color: #1f2937;
  }

  @media (max-width: 640px) {
    .progress-container {
      padding: 0.75rem;
    }
    
    .indicator {
      width: 0.4rem;
      height: 0.4rem;
    }
  }
</style>