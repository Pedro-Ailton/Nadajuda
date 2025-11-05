
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Flame, Trophy, User, Bot } from 'lucide-react';
import { Logo } from '@/components/logo';
import { cn } from '@/lib/utils';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const features = [
    {
        icon: <Home className="h-8 w-8 text-primary" />,
        title: 'Painel Principal',
        description: 'Tenha uma visão geral do seu progresso, com o seu melhor tempo recente, total de competições e um gráfico de performance.',
    },
    {
        icon: <Flame className="h-8 w-8 text-primary" />,
        title: 'Registo de Treinos',
        description: 'Crie e edite as suas séries de treino de forma detalhada. Adicione fases, repetições, descrições, e registe os tempos de cada tiro.',
    },
    {
        icon: <Bot className="h-8 w-8 text-primary" />,
        title: 'Treinador com IA',
        description: 'Não sabe o que treinar hoje? Deixe que a nossa Inteligência Artificial crie um treino personalizado para si com base nos seus objetivos.',
    },
    {
        icon: <Trophy className="h-8 w-8 text-primary" />,
        title: 'Registo de Competições',
        description: 'Registe os seus tempos oficiais de competição. Selecione a prova e insira o seu tempo em minutos, segundos e milissegundos.',
    },
    {
        icon: <User className="h-8 w-8 text-primary" />,
        title: 'Perfil',
        description: 'Mantenha os seus dados atualizados. A sua data de nascimento é importante para que a IA possa gerar treinos adequados à sua idade.',
    }
];

export default function TutorialPage() {
    const router = useRouter();
    const [currentSlide, setCurrentSlide] = useState(0);

    const handleStart = () => {
        router.push('/dashboard');
    };

    const handleNext = () => {
        if (currentSlide < features.length - 1) {
            setCurrentSlide(currentSlide + 1);
        }
    };

    const handlePrev = () => {
        if (currentSlide > 0) {
            setCurrentSlide(currentSlide - 1);
        }
    };
    
    const currentFeature = features[currentSlide];

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 md:p-8 overflow-hidden">
            <div className="w-full max-w-lg mx-auto">
                <header className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <Logo />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-headline font-bold">Bem-vindo(a) ao Nadajuda!</h1>
                    <p className="text-muted-foreground mt-2 text-lg">Um resumo do que pode fazer na aplicação.</p>
                </header>

                <main className="relative h-[280px]">
                    <div key={currentSlide} className="w-full h-full absolute transition-all duration-300 ease-in-out">
                         <Card className="shadow-md h-full flex flex-col justify-center">
                            <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                                <div className="bg-primary/10 p-3 rounded-full">
                                    {currentFeature.icon}
                                </div>
                                <CardTitle>{currentFeature.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-md text-muted-foreground">{currentFeature.description}</p>
                            </CardContent>
                        </Card>
                    </div>
                </main>
                
                <footer className="mt-8">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        {features.map((_, index) => (
                            <button 
                                key={index} 
                                onClick={() => setCurrentSlide(index)}
                                className={cn(
                                    "h-2 w-2 rounded-full bg-muted transition-all",
                                    currentSlide === index ? "w-4 bg-primary" : "hover:bg-muted-foreground"
                                )}
                                aria-label={`Ir para o slide ${index + 1}`}
                             />
                        ))}
                    </div>

                    <div className="flex items-center justify-between">
                        {currentSlide > 0 ? (
                            <Button variant="outline" onClick={handlePrev}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Anterior
                            </Button>
                        ) : (
                            <div /> // Placeholder to keep the layout consistent
                        )}
                        
                        {currentSlide === features.length - 1 ? (
                            <Button onClick={handleStart} size="lg">
                                Começar a Usar!
                            </Button>
                        ) : (
                             <Button onClick={handleNext}>
                                Próximo
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </footer>
            </div>
        </div>
    )
}
