"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, ArrowRight, Compass } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

const TOTAL_STEPS = 11 // steps 1-10 + step 11 is contact info

type SurveyData = Record<string, any>

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

const TRAVEL_STYLES = [
  { value: "LUXURY", label: "Luxury", emoji: "✨" },
  { value: "ADVENTURE", label: "Adventure", emoji: "🏔️" },
  { value: "CULTURAL", label: "Cultural", emoji: "🏛️" },
  { value: "ROMANTIC", label: "Romantic", emoji: "💕" },
  { value: "FAMILY", label: "Family", emoji: "👨‍👩‍👧‍👦" },
  { value: "WELLNESS", label: "Wellness", emoji: "🧘" },
  { value: "FOODIE", label: "Foodie", emoji: "🍷" },
  { value: "SCENIC", label: "Scenic", emoji: "📷" },
  { value: "SOLO", label: "Solo", emoji: "🎒" },
]

const TRAVELER_TYPES = [
  { value: "COUPLE", label: "Couple", emoji: "👫" },
  { value: "HONEYMOON", label: "Honeymoon", emoji: "💍" },
  { value: "ANNIVERSARY", label: "Anniversary", emoji: "🥂" },
  { value: "SOLO", label: "Solo", emoji: "🎒" },
  { value: "FAMILY_YOUNG_KIDS", label: "Family (young kids)", emoji: "🧸" },
  { value: "FAMILY_TEENS", label: "Family (teens)", emoji: "🎯" },
  { value: "GROUP_FRIENDS", label: "Group of Friends", emoji: "🎉" },
  { value: "MULTI_GEN", label: "Multi-Generational", emoji: "👴👶" },
]

const INTERESTS = [
  "History & Architecture", "Art & Museums", "Food & Wine", "Nature & Wildlife",
  "Photography", "Beaches & Water", "Hiking & Trekking", "Wellness & Spas",
  "Nightlife", "Local Markets", "Cooking Classes", "Sailing & Boating",
  "Skiing & Snow Sports", "Safari", "Cycling", "Shopping",
]

const ACCOMMODATION_TYPES = [
  { value: "LUXURY_HOTEL", label: "Luxury Hotels", emoji: "🏨" },
  { value: "BOUTIQUE", label: "Boutique Properties", emoji: "🏡" },
  { value: "VILLA", label: "Private Villas", emoji: "🏰" },
  { value: "RESORT", label: "All-Inclusive Resorts", emoji: "🌴" },
  { value: "DESIGN_HOTEL", label: "Design Hotels", emoji: "🎨" },
  { value: "HISTORIC", label: "Historic/Palace Hotels", emoji: "🏯" },
]

function MultiSelect({
  options, value, onChange, columns = 2
}: {
  options: { value: string; label: string; emoji?: string }[]
  value: string[]
  onChange: (val: string[]) => void
  columns?: number
}) {
  const toggle = (v: string) => {
    if (value.includes(v)) onChange(value.filter(x => x !== v))
    else onChange([...value, v])
  }

  return (
    <div className={cn(
      "grid gap-3",
      columns === 2 ? "grid-cols-2" : columns === 3 ? "grid-cols-3" : "grid-cols-1"
    )}>
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => toggle(opt.value)}
          className={cn(
            "flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all",
            value.includes(opt.value)
              ? "border-primary-600 bg-primary-50 text-primary-800"
              : "border-gray-200 bg-white hover:border-gray-300 text-gray-700"
          )}
        >
          {opt.emoji && <span className="text-xl shrink-0">{opt.emoji}</span>}
          <span className="text-sm font-medium">{opt.label}</span>
        </button>
      ))}
    </div>
  )
}

function SingleSelect({
  options, value, onChange
}: {
  options: { value: string; label: string; emoji?: string; desc?: string }[]
  value: string
  onChange: (val: string) => void
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all",
            value === opt.value
              ? "border-primary-600 bg-primary-50 text-primary-800"
              : "border-gray-200 bg-white hover:border-gray-300 text-gray-700"
          )}
        >
          {opt.emoji && <span className="text-2xl shrink-0">{opt.emoji}</span>}
          <div>
            <div className="text-sm font-medium">{opt.label}</div>
            {opt.desc && <div className="text-xs text-gray-500 mt-0.5">{opt.desc}</div>}
          </div>
        </button>
      ))}
    </div>
  )
}

export default function SurveyStepPage() {
  const router = useRouter()
  const params = useParams()
  const step = parseInt(params.step as string)

  // Redirect invalid step numbers
  if (isNaN(step) || step < 1 || step > TOTAL_STEPS) {
    router.replace('/survey/step/1')
    return null
  }

  const [data, setData] = useState<SurveyData>(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('voyagr_survey')
      return saved ? JSON.parse(saved) : {}
    }
    return {}
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('voyagr_survey', JSON.stringify(data))
    }
  }, [data])

  const updateField = (key: string, value: any) => {
    setData(prev => ({ ...prev, [key]: value }))
  }

  const goNext = () => {
    if (step < TOTAL_STEPS) router.push(`/survey/step/${step + 1}`)
  }

  const goBack = () => {
    if (step > 1) router.push(`/survey/step/${step - 1}`)
    else router.push('/survey')
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/survey/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await response.json()
      if (response.ok) {
        sessionStorage.removeItem('voyagr_survey')
        router.push('/thank-you?submitted=true')
      } else {
        alert('Something went wrong. Please try again.')
      }
    } catch (err) {
      alert('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const progress = (step / TOTAL_STEPS) * 100

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-serif font-bold text-primary-900 mb-2">Who's traveling?</h2>
              <p className="text-gray-600">This helps us tailor the trip to your group's needs.</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3 block">Traveler type</Label>
              <SingleSelect
                options={TRAVELER_TYPES}
                value={data.travelerType || ''}
                onChange={(v) => updateField('travelerType', v)}
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Group size</Label>
              <Input
                type="number"
                min={1}
                max={30}
                value={data.groupSize || ''}
                onChange={e => updateField('groupSize', parseInt(e.target.value))}
                className="w-32 text-lg"
                placeholder="2"
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-serif font-bold text-primary-900 mb-2">Trip basics</h2>
              <p className="text-gray-600">When are you thinking and how long?</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3 block">Trip duration (days)</Label>
              <div className="flex items-center gap-4">
                <div>
                  <Label className="text-xs text-gray-500 mb-1 block">Minimum</Label>
                  <Input
                    type="number" min={3} max={60}
                    value={data.tripDurationMin || ''}
                    onChange={e => updateField('tripDurationMin', parseInt(e.target.value))}
                    className="w-24"
                    placeholder="7"
                  />
                </div>
                <span className="text-gray-400 mt-5">to</span>
                <div>
                  <Label className="text-xs text-gray-500 mb-1 block">Maximum</Label>
                  <Input
                    type="number" min={3} max={60}
                    value={data.tripDurationMax || ''}
                    onChange={e => updateField('tripDurationMax', parseInt(e.target.value))}
                    className="w-24"
                    placeholder="14"
                  />
                </div>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3 block">Preferred months to travel</Label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {MONTHS.map((month, i) => {
                  const months = data.tripMonths || []
                  const monthNum = i + 1
                  const selected = months.includes(monthNum)
                  return (
                    <button
                      key={month}
                      type="button"
                      onClick={() => {
                        if (selected) updateField('tripMonths', months.filter((m: number) => m !== monthNum))
                        else updateField('tripMonths', [...months, monthNum])
                      }}
                      className={cn(
                        "py-2 px-3 rounded-lg text-sm border transition-all",
                        selected
                          ? "border-primary-600 bg-primary-50 text-primary-800 font-medium"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      )}
                    >
                      {month.slice(0, 3)}
                    </button>
                  )
                })}
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3 block">Budget range (total for group)</Label>
              <SingleSelect
                options={[
                  { value: "UNDER_3K", label: "Under $3,000", emoji: "💵" },
                  { value: "THREE_TO_5K", label: "$3,000 – $5,000", emoji: "💰" },
                  { value: "FIVE_TO_10K", label: "$5,000 – $10,000", emoji: "💎" },
                  { value: "TEN_TO_20K", label: "$10,000 – $20,000", emoji: "✨" },
                  { value: "OVER_20K", label: "Over $20,000", emoji: "👑" },
                ]}
                value={data.budget || ''}
                onChange={(v) => updateField('budget', v)}
              />
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-serif font-bold text-primary-900 mb-2">Destination</h2>
              <p className="text-gray-600">Do you have somewhere in mind, or would you like us to suggest?</p>
            </div>
            <div>
              <SingleSelect
                options={[
                  { value: "yes", label: "I have destination(s) in mind", emoji: "📍", desc: "Tell us where you want to go" },
                  { value: "no", label: "I'm open to suggestions", emoji: "🌍", desc: "We'll recommend based on your preferences" },
                  { value: "partial", label: "Some ideas, but open to suggestions", emoji: "🗺️", desc: "Hybrid approach" },
                ]}
                value={data.destinationsKnown === true ? 'yes' : data.destinationsKnown === false ? 'no' : data.destinationsPartial ? 'partial' : ''}
                onChange={(v) => {
                  if (v === 'yes') { updateField('destinationsKnown', true); updateField('openToSuggestions', false) }
                  else if (v === 'no') { updateField('destinationsKnown', false); updateField('openToSuggestions', true) }
                  else { updateField('destinationsPartial', true); updateField('openToSuggestions', true) }
                }}
              />
            </div>
            {(data.destinationsKnown || data.destinationsPartial) && (
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Which destination(s)?</Label>
                <Textarea
                  value={(data.destinationsList || []).join(', ')}
                  onChange={e => updateField('destinationsList', e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean))}
                  placeholder="e.g., Iceland, Paris, Amalfi Coast"
                  className="h-20"
                />
              </div>
            )}
            {!data.destinationsKnown && (
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Any regions you're drawn to?</Label>
                <MultiSelect
                  options={[
                    { value: "europe", label: "Europe", emoji: "🇪🇺" },
                    { value: "asia", label: "Asia", emoji: "🌏" },
                    { value: "americas", label: "Americas", emoji: "🌎" },
                    { value: "africa", label: "Africa & Middle East", emoji: "🌍" },
                    { value: "oceania", label: "Oceania", emoji: "🦘" },
                    { value: "caribbean", label: "Caribbean", emoji: "🏝️" },
                  ]}
                  value={data.destinationOpenTo || []}
                  onChange={v => updateField('destinationOpenTo', v)}
                />
              </div>
            )}
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-serif font-bold text-primary-900 mb-2">Travel style</h2>
              <p className="text-gray-600">Select everything that resonates with how you like to travel.</p>
            </div>
            <MultiSelect
              options={TRAVEL_STYLES}
              value={data.travelStyles || []}
              onChange={v => updateField('travelStyles', v)}
              columns={3}
            />
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3 block">What's your ideal pace?</Label>
              <SingleSelect
                options={[
                  { value: "slow", label: "Slow & deep", emoji: "☕", desc: "2-3 nights per place, lots of wandering time" },
                  { value: "moderate", label: "Balanced", emoji: "🚶", desc: "Mix of exploring and relaxing" },
                  { value: "fast", label: "Active & full", emoji: "🏃", desc: "See and do as much as possible" },
                ]}
                value={data.pacePreference || ''}
                onChange={v => updateField('pacePreference', v)}
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3 block">Accommodation preference</Label>
              <MultiSelect
                options={ACCOMMODATION_TYPES}
                value={data.accommodationType || []}
                onChange={v => updateField('accommodationType', v)}
              />
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-serif font-bold text-primary-900 mb-2">Interests & experiences</h2>
              <p className="text-gray-600">What do you love? Select all that apply.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {INTERESTS.map(interest => {
                const interests = data.interests || []
                const selected = interests.includes(interest)
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => {
                      if (selected) updateField('interests', interests.filter((i: string) => i !== interest))
                      else updateField('interests', [...interests, interest])
                    }}
                    className={cn(
                      "py-2 px-3 rounded-lg text-sm border text-left transition-all",
                      selected
                        ? "border-primary-600 bg-primary-50 text-primary-800 font-medium"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    )}
                  >
                    {interest}
                  </button>
                )
              })}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Any must-have experiences?</Label>
              <Textarea
                value={data.mustHaveExperiences || ''}
                onChange={e => updateField('mustHaveExperiences', e.target.value)}
                placeholder="e.g., A cooking class, seeing the northern lights, a private wine tasting..."
                className="h-24"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Anything you want to avoid?</Label>
              <Textarea
                value={data.avoidExperiences || ''}
                onChange={e => updateField('avoidExperiences', e.target.value)}
                placeholder="e.g., Crowded tourist sites, early mornings, extreme physical activity..."
                className="h-20"
              />
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-serif font-bold text-primary-900 mb-2">Food & dining</h2>
              <p className="text-gray-600">Meals are often the best part of a trip. Tell us about your preferences.</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                How important is dining on this trip?{" "}
                <span className="text-primary-600 font-bold">{data.diningImportance || 7}/10</span>
              </Label>
              <input
                type="range" min={1} max={10}
                value={data.diningImportance || 7}
                onChange={e => updateField('diningImportance', parseInt(e.target.value))}
                className="w-full accent-primary-700"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Just fuel</span>
                <span>Central to the trip</span>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3 block">Dining style preference</Label>
              <SingleSelect
                options={[
                  { value: "local", label: "Local & authentic", emoji: "🍜", desc: "Where locals actually eat" },
                  { value: "upscale", label: "Upscale & fine dining", emoji: "🍷", desc: "Michelin stars and special occasions" },
                  { value: "mix", label: "Mix of both", emoji: "🥘", desc: "Street food by day, fine dining at night" },
                ]}
                value={data.diningStyle || ''}
                onChange={v => updateField('diningStyle', v)}
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Dietary restrictions or preferences</Label>
              <MultiSelect
                options={[
                  { value: "vegetarian", label: "Vegetarian", emoji: "🥗" },
                  { value: "vegan", label: "Vegan", emoji: "🌱" },
                  { value: "halal", label: "Halal", emoji: "☪️" },
                  { value: "kosher", label: "Kosher", emoji: "✡️" },
                  { value: "gluten_free", label: "Gluten-free", emoji: "🌾" },
                  { value: "none", label: "No restrictions", emoji: "✅" },
                ]}
                value={data.dietaryRestrictions || []}
                onChange={v => updateField('dietaryRestrictions', v)}
              />
            </div>
          </div>
        )

      case 7:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-serif font-bold text-primary-900 mb-2">Your travel history</h2>
              <p className="text-gray-600">Knowing where you've been helps us recommend what's next.</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Countries you've visited</Label>
              <Textarea
                value={(data.countriesVisited || []).join(', ')}
                onChange={e => updateField('countriesVisited', e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean))}
                placeholder="e.g., France, Italy, Thailand, Japan..."
                className="h-20"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">What made your favorite trip so good?</Label>
              <Textarea
                value={data.favoriteTrip || ''}
                onChange={e => updateField('favoriteTrip', e.target.value)}
                placeholder="Tell us about a trip you loved and what made it special..."
                className="h-24"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Anything you didn't enjoy on past trips?</Label>
              <Textarea
                value={data.worstTripAspect || ''}
                onChange={e => updateField('worstTripAspect', e.target.value)}
                placeholder="e.g., Too rushed, poor hotel, bad weather, over-touristed..."
                className="h-20"
              />
            </div>
          </div>
        )

      case 8:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-serif font-bold text-primary-900 mb-2">Special details</h2>
              <p className="text-gray-600">Anything else we should know to make this trip perfect?</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Are you celebrating anything?</Label>
              <Textarea
                value={data.celebrationDetails || ''}
                onChange={e => updateField('celebrationDetails', e.target.value)}
                placeholder="e.g., Honeymoon, 25th anniversary, milestone birthday, graduation..."
                className="h-20"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Accessibility or mobility needs</Label>
              <Textarea
                value={data.accessibilityNeeds || ''}
                onChange={e => updateField('accessibilityNeeds', e.target.value)}
                placeholder="Any mobility limitations, medical considerations, or accessibility requirements..."
                className="h-20"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Any other requests?</Label>
              <Textarea
                value={data.otherRequests || ''}
                onChange={e => updateField('otherRequests', e.target.value)}
                placeholder="Anything else you'd like us to know..."
                className="h-20"
              />
            </div>
          </div>
        )

      case 9:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-serif font-bold text-primary-900 mb-2">Planning preferences</h2>
              <p className="text-gray-600">How do you like to work with your advisor?</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3 block">How involved do you want to be?</Label>
              <SingleSelect
                options={[
                  { value: "hands_off", label: "Hands off — surprise me", emoji: "🙌", desc: "I trust you, just build something great" },
                  { value: "collaborative", label: "Collaborative", emoji: "🤝", desc: "I want to be involved in key decisions" },
                  { value: "hands_on", label: "Hands on", emoji: "📋", desc: "I want to approve every detail" },
                ]}
                value={data.planningInvolvement || ''}
                onChange={v => updateField('planningInvolvement', v)}
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3 block">Preferred communication</Label>
              <SingleSelect
                options={[
                  { value: "email", label: "Email", emoji: "📧" },
                  { value: "phone", label: "Phone", emoji: "📞" },
                  { value: "video", label: "Video Call", emoji: "📹" },
                  { value: "any", label: "Whatever works", emoji: "👍" },
                ]}
                value={data.communicationPref || ''}
                onChange={v => updateField('communicationPref', v)}
              />
            </div>
          </div>
        )

      case 10:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-serif font-bold text-primary-900 mb-2">The feeling</h2>
              <p className="text-gray-600">This is the most important question. We design toward feelings, not just logistics.</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                What do you want to feel on this trip?
              </Label>
              <Textarea
                value={data.tripFeeling || ''}
                onChange={e => updateField('tripFeeling', e.target.value)}
                placeholder="e.g., Completely disconnected from work and stress. Like I'm living in a dream. Romance and spontaneity. Like a local, not a tourist..."
                className="h-28"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                If this trip had one word, what would it be?
              </Label>
              <Input
                value={data.oneWord || ''}
                onChange={e => updateField('oneWord', e.target.value)}
                placeholder="e.g., Magical, Adventurous, Romantic, Transformative..."
                className="text-lg"
              />
            </div>
          </div>
        )

      case 11:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-serif font-bold text-primary-900 mb-2">Almost done!</h2>
              <p className="text-gray-600">Just your contact info so your advisor can reach out.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-1.5 block">First name *</Label>
                <Input
                  value={data.firstName || ''}
                  onChange={e => updateField('firstName', e.target.value)}
                  placeholder="Sarah"
                  className="text-base"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Last name *</Label>
                <Input
                  value={data.lastName || ''}
                  onChange={e => updateField('lastName', e.target.value)}
                  placeholder="Thompson"
                  className="text-base"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Email address *</Label>
              <Input
                type="email"
                value={data.email || ''}
                onChange={e => updateField('email', e.target.value)}
                placeholder="sarah@example.com"
                className="text-base"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-1.5 block">Phone (optional)</Label>
              <Input
                type="tel"
                value={data.phone || ''}
                onChange={e => updateField('phone', e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="text-base"
              />
            </div>
            <div className="bg-gold-50 rounded-xl p-4 text-sm text-gold-800 border border-gold-200">
              <strong>You're almost done!</strong> We'll review your traveler profile and have your dedicated
              advisor reach out within 24 hours to start planning.
            </div>
          </div>
        )

      default:
        return <div>Unknown step</div>
    }
  }

  const stepLabels = [
    "Who's Traveling", "Trip Basics", "Destination", "Travel Style",
    "Interests", "Dining", "Travel History", "Special Requests",
    "Planning Style", "The Feeling", "Contact Info"
  ]

  return (
    <div className="min-h-screen bg-sand-50 pt-16">
      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-gray-500">
              Step {step} of {TOTAL_STEPS}: {stepLabels[step - 1]}
            </span>
            <span className="text-xs text-gray-400">{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>

        {/* Step Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 mb-6">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={goBack}
            className="border-gray-200 text-gray-600"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back
          </Button>

          {step < TOTAL_STEPS ? (
            <Button variant="navy" onClick={goNext}>
              Continue
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          ) : (
            <Button
              variant="gold"
              onClick={handleSubmit}
              disabled={isSubmitting || !data.firstName || !data.lastName || !data.email}
            >
              {isSubmitting ? "Submitting..." : "Submit My Survey"}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
