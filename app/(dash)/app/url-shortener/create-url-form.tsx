'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/use-toast'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { GetResult } from '@prisma/client/runtime'
import { CreateShortenedUrlInput } from '@/lib/services/url-shortener.service'
import { shortening } from './create-url-action'
// import { shortening } from './create-url-action'

export const FormSchema = z.object({
    url: z
        .string()
        .min(2, {
            message: 'Url must be at least 2 characters.',
        })
        .url({ message: 'That is not an url' }),
    customId: z
        .string()
        .min(6, {
            message: 'Custom Id must be at least 6 characters.',
        })
        .max(50)
        .optional(),
    direct: z.boolean().default(false).optional(),
    userId: z.string(),
})

export type CreateUrlFormProps = {
    userId: string
}

function CreateUrlForm({ userId, shorten }: CreateUrlFormProps) {
    const [useCustomId, setUseCustomId] = useState(false)

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            direct: true,
            userId: userId,
        },
    })

    function onSubmit(data: z.infer<typeof FormSchema>) {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        console.log(data)
        shortening(data)
            .then((res) => {
                toast({
                    title: 'Shortened url:',
                    description: (
                        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
                            <code className="text-white">
                                {JSON.stringify(res, null, 2)}
                            </code>
                        </pre>
                    ),
                })
            })
            .catch(console.error)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <Card>
                    <CardContent className="pt-4 space-y-2">
                        <FormField
                            control={form.control}
                            name="url"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>URL</FormLabel>
                                    <FormControl>
                                        <Input
                                            required
                                            placeholder="your very long url..."
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="customId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="space-x-2">
                                        <Checkbox
                                            id="useCustomId"
                                            checked={useCustomId}
                                            onCheckedChange={(e) => {
                                                setUseCustomId(
                                                    e.valueOf() as boolean
                                                )
                                            }}
                                        />
                                        <label htmlFor="useCustomId">
                                            Custom ID {'(optional)'}
                                        </label>
                                    </FormLabel>
                                    {useCustomId && (
                                        <>
                                            <FormControl>
                                                <Input
                                                    placeholder="Customize your shortened url's ID"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </>
                                    )}
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="direct"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            // @ts-ignore
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>
                                            Use direct redirect
                                        </FormLabel>
                                        <FormDescription>
                                            When this is turned on, the
                                            shortened url will be redirected to
                                            the protected page before redirect
                                            to the target url.
                                        </FormDescription>
                                    </div>
                                </FormItem>
                            )}
                        />
                    </CardContent>
                    <CardFooter className="flex flex-row justify-between items-center space-x-2">
                        <Button className="w-full" type="submit">
                            Shorten
                        </Button>
                        <Button
                            onClick={(e) => {
                                e.preventDefault()
                                setUseCustomId(false)
                                form.reset({
                                    url: '',
                                    customId: undefined,
                                    direct: true,
                                    userId: userId,
                                })
                            }}
                            variant={'secondary'}
                            className="w-full"
                        >
                            Reset
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </Form>
    )
}

export default CreateUrlForm
