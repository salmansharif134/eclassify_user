"use client"
import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { t } from '@/utils'
import { toast } from 'sonner'
import { changePasswordApi } from '@/utils/api'

const ChangePasswordModal = ({ children }) => {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    })

    const handleChange = (e) => {
        const { id, value } = e.target
        setFormData(prev => ({ ...prev, [id]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.oldPassword || !formData.newPassword || !formData.confirmPassword) {
            toast.error(t('allFieldsRequired'))
            return
        }

        if (formData.newPassword !== formData.confirmPassword) {
            toast.error(t('passwordsDoNotMatch'))
            return
        }

        try {
            setIsLoading(true)
            const response = await changePasswordApi.changePassword({
                password: formData.newPassword,
                currentPassword: formData.oldPassword,
                newPasswordConfirmation: formData.confirmPassword
            })

            const data = response.data
            if (data.error === false) {
                toast.success(data.message || t('passwordChangedSuccessfully'))
                setOpen(false)
                setFormData({
                    oldPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                })
            } else {
                toast.error(data.message || t('failedToChangePassword'))
            }
        } catch (error) {
            console.error('Change password error:', error)
            toast.error(t('somethingWentWrong'))
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t('changePassword')}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="oldPassword">{t('oldPassword')}</Label>
                        <Input
                            id="oldPassword"
                            type="password"
                            value={formData.oldPassword}
                            onChange={handleChange}
                            placeholder={t('enterOldPassword')}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="newPassword">{t('newPassword')}</Label>
                        <Input
                            id="newPassword"
                            type="password"
                            value={formData.newPassword}
                            onChange={handleChange}
                            placeholder={t('enterNewPassword')}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="confirmPassword">{t('retypePassword')}</Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder={t('retypeNewPassword')}
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? t('updating') : t('update')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default ChangePasswordModal
