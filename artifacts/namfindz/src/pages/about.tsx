import { Link } from "wouter";
import { ArrowRight, Shield, Heart, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function About() {
  return (
    <div className="flex flex-col pb-16">
      {/* Hero */}
      <section className="bg-secondary/30 py-16 md:py-24 border-b border-border/50">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-6">
            Building a community of care
          </h1>
          <p className="text-xl text-muted-foreground mb-0">
            namFindz is a centralized, secure platform designed to help people in Namibia recover lost personal items and important documents quickly and safely.
          </p>
        </div>
      </section>

      {/* The Problem & Solution */}
      <section className="py-16 md:py-24 container mx-auto px-4 max-w-5xl">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">The Old Way vs. The namFindz Way</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-destructive flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-destructive" /> The Old Way
                </h3>
                <p className="text-muted-foreground">
                  Losing an ID or wallet meant paying for expensive newspaper classified ads, hoping someone spots it, posting on scattered Facebook groups, or spending days visiting different police stations. It was slow, frustrating, and often hopeless.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-primary flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-primary" /> The namFindz Way
                </h3>
                <p className="text-muted-foreground">
                  A single, searchable digital hub. Smart matching algorithms connect lost reports with found items instantly. Secure messaging lets you communicate without sharing your phone number publicly. It's fast, free to use, and builds on the honesty of our community.
                </p>
              </div>
            </div>
          </div>
          <div className="bg-primary/5 rounded-2xl p-8 border border-primary/10">
            <h3 className="text-xl font-bold mb-6">Core Values</h3>
            <div className="space-y-6">
              <div className="flex gap-4">
                <Heart className="h-6 w-6 text-primary flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Community First</h4>
                  <p className="text-sm text-muted-foreground">We believe most people want to do the right thing. We just make it easier for them to do so.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Shield className="h-6 w-6 text-primary flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Privacy & Security</h4>
                  <p className="text-sm text-muted-foreground">Your contact info stays hidden until you choose to share it via our secure in-app messaging.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Search className="h-6 w-6 text-primary flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Smart Technology</h4>
                  <p className="text-sm text-muted-foreground">Our algorithms suggest matches automatically, doing the hard work of searching for you.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Safety Guidelines */}
      <section className="bg-card border-y border-border/50 py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-4xl text-center mb-12">
          <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Guidelines for Safe Handover</h2>
          <p className="text-muted-foreground">
            Your safety is our top priority. Please follow these simple rules when meeting to return or claim an item.
          </p>
        </div>
        
        <div className="container mx-auto px-4 max-w-5xl grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div className="bg-background p-6 rounded-xl border border-border/50 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold mb-4">1</div>
            <h3 className="font-bold mb-2">Meet in Public</h3>
            <p className="text-sm text-muted-foreground">Always arrange to meet in a busy, well-lit public place like a mall, coffee shop, or near a police station. Never go to someone's private residence.</p>
          </div>
          <div className="bg-background p-6 rounded-xl border border-border/50 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold mb-4">2</div>
            <h3 className="font-bold mb-2">Verify Ownership</h3>
            <p className="text-sm text-muted-foreground">If you found an item, ask the claimant to describe a specific detail not visible in the photo (e.g., "what else was in the wallet?").</p>
          </div>
          <div className="bg-background p-6 rounded-xl border border-border/50 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold mb-4">3</div>
            <h3 className="font-bold mb-2">Bring a Friend</h3>
            <p className="text-sm text-muted-foreground">It's always safer to bring someone with you when meeting a stranger, and tell someone else where you are going.</p>
          </div>
          <div className="bg-background p-6 rounded-xl border border-border/50 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold mb-4">4</div>
            <h3 className="font-bold mb-2">No Advance Payments</h3>
            <p className="text-sm text-muted-foreground">Never wire money or pay a "reward" in advance. Even if a reward was offered, only hand it over in person when you have your item.</p>
          </div>
          <div className="bg-background p-6 rounded-xl border border-border/50 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold mb-4">5</div>
            <h3 className="font-bold mb-2">Check ID</h3>
            <p className="text-sm text-muted-foreground">If returning important documents like a passport or ID card, ensure the person's face matches the document before handing it over.</p>
          </div>
          <div className="bg-background p-6 rounded-xl border border-border/50 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold mb-4">6</div>
            <h3 className="font-bold mb-2">Stay on Platform</h3>
            <p className="text-sm text-muted-foreground">Keep communication on namFindz as long as possible. If someone immediately demands your WhatsApp number, be cautious.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 container mx-auto px-4 text-center max-w-3xl">
        <h2 className="text-3xl font-bold mb-6">Ready to help the community?</h2>
        <p className="text-xl text-muted-foreground mb-8">
          Whether you've lost something precious or found something that isn't yours, you're in the right place.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/report/found">
            <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-base">
              I Found Something
            </Button>
          </Link>
          <Link href="/browse">
            <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 text-base">
              Browse Reports <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}